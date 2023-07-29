import stringHash from '@sindresorhus/string-hash';
import { production } from './environment';

const hash = (str: string) => stringHash(str).toString(36);

export const hashClasses = (filename: string, classes: string) => {
  return production
    ? `uno-${hash(filename + classes)}`
    : `_${classes}_${hash(filename)}`;
};
