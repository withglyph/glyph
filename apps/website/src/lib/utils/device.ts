export function isMobile() {
  // cspell:disable-next-line
  const regex = /mobi|android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  return regex.test(navigator.userAgent);
}
