import { customAlphabet } from 'nanoid';

export { nanoid as createId } from 'nanoid';
export const createHandle = customAlphabet(
  '0123456789abcdefghijklmnopqrstuvwxyz',
  8
);
