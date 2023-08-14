import { MAX_ITERATION } from './const';
import type { VBox } from './vbox';

type VBoxKeyExtractor = (vbox: VBox) => number;

export class PriorityQueue implements IterableIterator<VBox> {
  #keyExtractor: VBoxKeyExtractor;
  #items: VBox[] = [];

  constructor(keyExtractor: VBoxKeyExtractor) {
    this.#keyExtractor = keyExtractor;
  }

  [Symbol.iterator](): IterableIterator<VBox> {
    return this;
  }

  consume(pq: PriorityQueue): void {
    while (pq.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.push(pq.pop()!);
    }
  }

  next(): IteratorResult<VBox> {
    const value = this.pop();
    return value ? { value, done: false } : { value: null, done: true };
  }

  push(...items: VBox[]): void {
    this.#items.push(...items);
    this.#items.sort((a, b) => this.#keyExtractor(a) - this.#keyExtractor(b));
  }

  pop(): VBox | null {
    return this.#items.shift() ?? null;
  }

  split(targetLength: number): void {
    let iteration = 0;
    while (this.length < targetLength && iteration++ < MAX_ITERATION) {
      const vbox = this.pop();
      if (!vbox || vbox.count === 0) {
        return;
      }

      const [left, right] = vbox.split();

      if (left) {
        this.push(left);
      } else {
        throw new Error('left is null');
      }

      if (right) {
        this.push(right);
      } else {
        return;
      }
    }
  }

  get length(): number {
    return this.#items.length;
  }
}
