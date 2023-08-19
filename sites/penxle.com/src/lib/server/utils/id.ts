import { nanoid } from 'nanoid';

export const createS3ObjectKey = (prefix: string) => {
  const key = nanoid(24);
  return `${prefix}/${key[0]}/${key[0]}${key[1]}/${key}`;
};
