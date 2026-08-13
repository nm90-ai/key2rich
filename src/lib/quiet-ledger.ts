export const LOCKER_ID =
  (import.meta.env["VITE_CPAGRIP_LOCKER_ID"] as string | undefined) ?? "1908703";

export type Variant = "deep" | "shallow";

export function buildSubid(source: string, variant: Variant, clickId: string | null) {
  return `${source}_${variant}_${encodeURIComponent(clickId || "direct")}`;
}

export function readTrackingParams(variant: Variant) {
  const params = new URLSearchParams(window.location.search);
  const clickId = params.get("click_id");
  const raw = (params.get("source") || "").toLowerCase();
  const source = raw === "tb" || raw === "coin" || raw === "fc" ? raw : "direct";
  return {
    click_id: clickId,
    source,
    page_variant: variant,
    subid: buildSubid(source, variant, clickId),
  };
}

const unlockKey = (subid: string) => `ql_unlocked_${subid}`;

export function isUnlocked(subid: string) {
  try {
    return window.localStorage.getItem(unlockKey(subid)) === "1";
  } catch {
    return false;
  }
}

export function persistUnlock(subid: string) {
  try {
    window.localStorage.setItem(unlockKey(subid), "1");
  } catch {
    /* ignore */
  }
}

/**
 * Genuine CPAGrip completion signals only — never an overlay close.
 * We accept: the global completion callback, a postMessage from the locker
 * domain, a completion cookie, or a success param on return.
 */
export function hasCompletionCookie() {
  const cookie = document.cookie || "";
  return /(?:^|;\s*)(?:cpagrip_?complete|og_?complete|lock_?complete)\s*=\s*(?:1|true|yes)/i.test(
    cookie,
  );
}

export function hasSuccessParam() {
  const p = new URLSearchParams(window.location.search);
  const v = (p.get("unlocked") || p.get("cpa_success") || "").toLowerCase();
  return v === "1" || v === "true";
}

declare global {
  interface Window {
    OGCompletionCallback?: () => void;
    cpagripCompleted?: () => void;
  }
}

export function lockerSrc(subid: string) {
  return `https://optilinklock.com/script_include.php?id=${LOCKER_ID}&subid=${encodeURIComponent(subid)}`;
}

const FRAME_ID = "ql-locker-frame";

/**
 * Opens the CPAGrip locker on demand — never on page load.
 *
 * The CPAGrip embed relies on `document.write()` during HTML parsing, which is
 * a no-op when a script is appended to an already-parsed page (that is why a
 * plain dynamic <script> injection did nothing). So we mount the exact embed
 * code inside a full-viewport, same-origin overlay frame where it is parsed
 * normally and the locker can render + call `call_locker()` itself.
 */
export function launchLocker(subid: string) {
  const existing = document.getElementById(FRAME_ID) as HTMLIFrameElement | null;
  if (existing) {
    existing.style.display = "block";
    return;
  }

  const frame = document.createElement("iframe");
  frame.id = FRAME_ID;
  frame.title = "Unlock content";
  frame.setAttribute(
    "allow",
    "clipboard-write; geolocation; camera; microphone; payment",
  );
  frame.style.cssText =
    "position:fixed;inset:0;width:100vw;height:100vh;border:0;z-index:2147483647;background:transparent";
  frame.srcdoc = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><base target="_blank"><style>html,body{margin:0;height:100%;background:transparent;overflow:hidden}</style></head><body>
<script type="text/javascript" src="${lockerSrc(subid)}"></script>
<noscript>Please enable JavaScript to access this page.<meta http-equiv="refresh" content="0;url=https://optilinklock.com/help/enable_javascript.php?lkt=1"></noscript>
</body></html>`;
  document.body.appendChild(frame);
}

/**
 * Subscribes to every genuine completion signal. Returns a cleanup fn.
 */
export function watchForCompletion(onComplete: () => void) {
  let done = false;
  const fire = () => {
    if (done) return;
    done = true;
    onComplete();
  };

  window.OGCompletionCallback = fire;
  window.cpagripCompleted = fire;

  const onMessage = (event: MessageEvent) => {
    if (!/optilinklock\.com|cpagrip\.com/i.test(event.origin)) return;
    const data = event.data;
    const text = typeof data === "string" ? data : JSON.stringify(data ?? "");
    if (/complete|success|unlock/i.test(text)) fire();
  };
  window.addEventListener("message", onMessage);

  const timer = window.setInterval(() => {
    if (hasCompletionCookie()) fire();
    // The locker runs inside a same-origin srcdoc frame, so its completion
    // globals / callbacks live on the frame window, not on ours.
    const frame = document.getElementById(FRAME_ID) as HTMLIFrameElement | null;
    const win = frame?.contentWindow as (Window & Record<string, unknown>) | null | undefined;
    if (!win) return;
    try {
      win["OGCompletionCallback"] = fire;
      win["cpagripCompleted"] = fire;
      for (const key of Object.keys(win)) {
        if (/_completed$/i.test(key) && win[key]) fire();
      }
    } catch {
      /* cross-origin navigation inside the frame — ignore */
    }
  }, 1000);

  return () => {
    window.removeEventListener("message", onMessage);
    window.clearInterval(timer);
  };
}
