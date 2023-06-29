import { customAlphabet, nanoid } from 'nanoid';

export const createId = () => nanoid(24);
export const createHandle = customAlphabet(
  '0123456789abcdefghijklmnopqrstuvwxyz',
  8
);
