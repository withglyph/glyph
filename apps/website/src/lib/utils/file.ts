// https://mimesniff.spec.whatwg.org/#matching-an-image-type-pattern
const mimes = [
  { mime: 'image/jpeg', pattern: [0xff, 0xd8, 0xff] },
  { mime: 'image/png', pattern: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/gif', pattern: [0x47, 0x49, 0x46, 0x38] },
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

// https://github.com/Vinsurs/dataurl-file/blob/d810d73/src/dataurl2file.ts
/**
 * Convert dataUrl to a file
 * @param dataurl a string indicates dataUrl resource
 * @param filename file name to be set to converted file, default `file`
 * @returns file instance
 */
export function dataurl2file(dataurl: string, filename = 'file'): File {
  const reg = /^data:(.*?);base64,([^"']+)$/;
  const match = dataurl.match(reg);
  if (!match) {
    throw new TypeError(`the parameter 'dataurl' should be a dataurl`);
  }
  const mime = match[1];
  const base64 = match[2];
  const bin = atob(base64);
  const ab = new ArrayBuffer(bin.length);
  const abView = new Uint8Array(ab);
  for (let i = 0; i < bin.length; i++) {
    // @ts-expect-error: 루프 중간에 undefined 값이 있어야 파일로 변환이 됩니다.
    abView[i] = bin.codePointAt(i);
  }
  return new File([ab], filename + '.' + mime.split('/')[1], { type: mime });
}
