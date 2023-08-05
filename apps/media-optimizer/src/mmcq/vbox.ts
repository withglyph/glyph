import { mapValues, max } from 'radash';
import { range } from 'radash';
import { getColorIndex } from './color';
import { COLOR_SIZE, HISTOGRAM_SIZE, MULTIPLIER, RSHIFT } from './const';
import { clamp } from './utils';
import type { Color, ColorChannel } from './color';

export class VBox {
  #min: Color;
  #max: Color;
  #histogram: number[];

  #average: Color | null = null;
  #count: number | null = null;
  #volume: number | null = null;

  constructor(min: Color, max: Color, histogram: number[]) {
    this.#min = { ...min };
    this.#max = { ...max };
    this.#histogram = [...histogram];
  }

  static from(buffer: Buffer) {
    const histogram = Array.from<number>({ length: HISTOGRAM_SIZE }).fill(0);

    const min = { r: 255, g: 255, b: 255 };
    const max = { r: 0, g: 0, b: 0 };

    for (let offset = 0; offset < buffer.length; offset += COLOR_SIZE) {
      const r = buffer[offset + 0] >> RSHIFT;
      const g = buffer[offset + 1] >> RSHIFT;
      const b = buffer[offset + 2] >> RSHIFT;

      const index = getColorIndex({ r, g, b });
      histogram[index]++;

      min.r = Math.min(min.r, r);
      max.r = Math.max(max.r, r);
      min.g = Math.min(min.g, g);
      max.g = Math.max(max.g, g);
      min.b = Math.min(min.b, b);
      max.b = Math.max(max.b, b);
    }

    return new VBox(min, max, histogram);
  }

  clone(): VBox {
    return new VBox(this.#min, this.#max, this.#histogram);
  }

  *range(channel: ColorChannel) {
    yield* range(this.#min[channel], this.#max[channel]);
  }

  split(): [VBox?, VBox?] {
    if (this.count === 0) {
      return [];
    }

    if (this.count === 1) {
      return [this];
    }

    const widths: [ColorChannel, number][] = [
      ['r', this.#max.r - this.#min.r + 1],
      ['g', this.#max.g - this.#min.g + 1],
      ['b', this.#max.b - this.#min.b + 1],
    ];

    const axis = max(widths, ([, width]) => width)![0];

    const aggregate = (axis: ColorChannel) => {
      const others = (['r', 'g', 'b'] as ColorChannel[]).filter(
        (channel) => channel !== axis,
      );

      let total = 0;
      const acc: Record<number, number> = {};

      for (const v1 of this.range(axis)) {
        for (const v2 of this.range(others[0])) {
          for (const v3 of this.range(others[1])) {
            const index = getColorIndex({
              [axis]: v1,
              [others[0]]: v2,
              [others[1]]: v3,
            } as Color);
            total += this.#histogram[index];
          }
        }
        acc[v1] = total;
      }

      return { total, acc };
    };

    const { total, acc } = aggregate(axis);
    const lookAHead = mapValues(acc, (value) => total - value);

    const minAxis = this.#min[axis];
    const maxAxis = this.#max[axis];

    const k = Number(
      Object.entries(acc).find(([, value]) => value > total / 2)![0],
    );

    const left = k - minAxis;
    const right = maxAxis - k;

    let d = clamp(
      left <= right
        ? Math.min(maxAxis - 1, Math.trunc(k + right / 2))
        : Math.max(minAxis, Math.trunc(k - 1 - left / 2)),
      minAxis,
      maxAxis,
    );

    while (acc[d] === 0) {
      d++;
    }

    while (lookAHead[d] === 0 && acc[d - 1] > 0) {
      d--;
    }

    const vbox1 = this.clone();
    const vbox2 = this.clone();

    vbox1.#max[axis] = d;
    vbox2.#min[axis] = d + 1;

    return [vbox1, vbox2];
  }

  get average(): Color {
    if (this.#average === null) {
      let total = 0;
      const sum = { r: 0, g: 0, b: 0 };

      for (const r of this.range('r')) {
        for (const g of this.range('g')) {
          for (const b of this.range('b')) {
            const index = getColorIndex({ r, g, b });
            const value = this.#histogram[index] ?? 0;

            total += value;
            sum.r += value * (r + 0.5) * MULTIPLIER;
            sum.g += value * (g + 0.5) * MULTIPLIER;
            sum.b += value * (b + 0.5) * MULTIPLIER;
          }
        }
      }

      const calc: (key: ColorChannel) => number = total
        ? (key) => sum[key] / total
        : (key) => ((this.#min[key] + this.#max[key] + 1) * MULTIPLIER) / 2;

      this.#average = {
        r: Math.trunc(calc('r')),
        g: Math.trunc(calc('g')),
        b: Math.trunc(calc('b')),
      };
    }

    return this.#average;
  }

  get count(): number {
    if (this.#count === null) {
      this.#count = 0;

      for (const r of this.range('r')) {
        for (const g of this.range('g')) {
          for (const b of this.range('b')) {
            const index = getColorIndex({ r, g, b });
            this.#count += this.#histogram[index];
          }
        }
      }
    }

    return this.#count;
  }

  get volume(): number {
    if (this.#volume === null) {
      this.#volume =
        (this.#max.r - this.#min.r + 1) *
        (this.#max.g - this.#min.g + 1) *
        (this.#max.b - this.#min.b + 1);
    }

    return this.#volume;
  }
}
