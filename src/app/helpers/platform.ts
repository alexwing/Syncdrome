/**
 * Detects whether the current runtime is a mobile/Android environment
 */
export function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return true;
  }
  const internals = (window as any).__TAURI_INTERNALS__;
  if (
    internals?.metadata?.currentWebview?.platform === "android" ||
    internals?.metadata?.currentWebview?.platform === "ios"
  ) {
    return true;
  }
  return false;
}
