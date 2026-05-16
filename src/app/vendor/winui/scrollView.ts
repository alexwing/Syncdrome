// Vendored from react-windows-ui. Locks body scroll while compensating for the
// scrollbar width so layout doesn't shift (used by NavBar's mobile float).

const getScrollbarWidth = (): number => {
  if (navigator.maxTouchPoints > 0) return 0;
  const probe = document.createElement("div");
  probe.style.position = "absolute";
  probe.style.top = "-9999px";
  probe.style.width = "50px";
  probe.style.height = "50px";
  probe.style.overflowY = "scroll";
  probe.style.visibility = "hidden";
  document.body.appendChild(probe);
  const width = probe.offsetWidth - probe.clientWidth;
  document.body.removeChild(probe);
  return width;
};

const hasVerticalScrollbar = (el: HTMLElement): boolean =>
  el.scrollHeight > el.clientHeight;

const setHeaderMobilePadding = (px: number): void => {
  const header = document.getElementsByClassName(
    "ui-navbar-header-mobile"
  )[0] as HTMLElement | undefined;
  if (header) header.style.paddingRight = `${px}px`;
};

export const disableScroll = (): void => {
  if (hasVerticalScrollbar(document.body)) {
    const w = getScrollbarWidth();
    document.body.style.paddingRight = `${w}px`;
    setHeaderMobilePadding(w);
  }
  document.body.classList.add("modal-open");
};

export const enableScroll = (): void => {
  document.body.style.paddingRight = "";
  setHeaderMobilePadding(0);
  document.body.classList.remove("modal-open");
};

export const ScrollView = { disableScroll, enableScroll };
