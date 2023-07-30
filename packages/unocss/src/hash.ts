import { relative } from 'node:path';
import stringHash from '@sindresorhus/string-hash';
import { production } from './environment';

const hash = (str: string) => stringHash(str).toString(36);

export const hashClasses = (filename: string, classes: string) => {
  const path = relative(process.cwd(), filename);

  return production
    ? `uno-${hash(path + classes)}`
    : `_${classes}_${hash(path)}`;
};
