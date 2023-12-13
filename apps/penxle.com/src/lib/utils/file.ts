// https://mimesniff.spec.whatwg.org/#matching-an-image-type-pattern
const mimes = [
  { mime: 'image/jpeg', pattern: [0xff, 0xd8, 0xff] },
  { mime: 'image/png', pattern: [0x89, 0x50, 0x4e, 0x47] },
];

export const fileMime = async (file: File) => {
  const blob = file.slice(0, 4);
  const buffer = new Uint8Array(await blob.arrayBuffer());

  for (const { mime, pattern } of mimes) {
    let match = true;

    // eslint-disable-next-line unicorn/no-for-loop
    for (let i = 0; i < pattern.length; ++i) {
      if (buffer[i] - pattern[i] !== 0) {
        match = false;
        break;
      }
    }

    if (match) {
      return mime;
    }
  }

  return 'application/octet-stream';
};
