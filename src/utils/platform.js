// iOS Safari (and every other browser on iOS — they all run on WebKit by
// Apple's policy) never fires `beforeinstallprompt`. "Add to Home Screen"
// only exists behind the Share sheet, so that's the best we can point people
// to there; there is no one-tap install API to call on iOS.
export const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent)
