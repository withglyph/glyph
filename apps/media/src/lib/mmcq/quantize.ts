import { FRACT_BY_POPULATIONS } from './const';
import { PriorityQueue } from './queue';
import { hex } from './utils';
import { VBox } from './vbox';

export const quantize = (buffer: Buffer, maxColors: number) => {
  if (buffer.length === 0 || maxColors < 2 || maxColors > 256) {
    throw new Error('invalid arguments');
  }

  const vbox = VBox.from(buffer);
  const pq = new PriorityQueue((vbox) => vbox.count);

  pq.push(vbox);
  pq.split(maxColors * FRACT_BY_POPULATIONS);

  const pq2 = new PriorityQueue((vbox) => vbox.count * vbox.volume);
  pq2.consume(pq);

  pq2.split(maxColors - pq2.length);

  return [...pq2].reverse().map((vbox) => hex(vbox.average));
};
