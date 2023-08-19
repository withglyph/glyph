import fs from 'node:fs';
import path from 'node:path';
import ig from 'ignore';

const matcher = ig().add(fs.readFileSync('.gitignore', 'utf8'));

export const ignore = (p) => {
  const relative = path.relative(process.cwd(), p);
  if (relative.length === 0) {
    return false;
  }

  return matcher.ignores(relative);
};
