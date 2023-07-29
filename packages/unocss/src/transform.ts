import MagicString from 'magic-string';
import type { UnocssPluginContext, UnoGenerator } from '@unocss/core';

export const transformCode = async (
  uno: UnoGenerator,
  filename: string,
  code: string,
  enforce?: 'pre' | 'post',
) => {
  const transformers = (uno.config.transformers ?? []).filter(
    (transformer) => transformer.enforce === enforce,
  );

  if (transformers.length === 0) {
    return;
  }

  const source = new MagicString(code);

  for (const { idFilter, transform } of transformers) {
    if (idFilter && !idFilter(filename)) {
      continue;
    }

    await transform(source, filename, { uno } as UnocssPluginContext);
  }

  if (source.hasChanged()) {
    return source.toString();
  }
};
