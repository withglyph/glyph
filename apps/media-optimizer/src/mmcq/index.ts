import { quantize } from './quantize';

export const getDominantColor = (buffer: Buffer) => {
  return quantize(buffer, 2)[0];
};
