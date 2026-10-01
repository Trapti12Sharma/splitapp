// iOS Safari (and every other browser on iOS — they all run on WebKit by
// Apple's policy) never fires `beforeinstallprompt`. "Add to Home Screen"
// only exists behind the Share sheet, so that's the best we can point people
// to there; there is no one-tap install API to call on iOS.
export const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent)

// Android Chrome DOES support `beforeinstallprompt`, but Chrome gates firing
// it on its own site-engagement heuristic (the manifest/service-worker
// criteria can all pass and the event can still take longer than a fixed
// wait, or not fire this visit at all, especially on a brand new visit with
// no interaction yet) — unlike iOS, there's no hard "never happens" rule
// here, so this is used only as a timed-out fallback, pointing people at the
// install option that's always sitting in Chrome's own menu regardless of
// whether the event ever fired.
export const isAndroid = () => /android/i.test(window.navigator.userAgent)
