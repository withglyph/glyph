import MagicString from 'magic-string';
import type {
  SourceCodeTransformer,
  UnocssPluginContext,
  UnoGenerator,
} from '@unocss/core';
import type { TransformResult } from 'rollup';

const transformIdRE = /\.(css|svelte)($|\?)/;

export const transformCode = async (
  uno: UnoGenerator,
  filename: string,
  code: string,
  enforce: 'pre' | 'post' | 'default',
): Promise<TransformResult> => {
  if (!transformIdRE.test(filename)) {
    return;
  }

  const transformers = [
    transformerEmptyBlock(),
    ...(uno.config.transformers ?? []),
  ].filter((transformer) => (transformer.enforce ?? 'default') === enforce);

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
    return {
      code: source.toString(),
      map: source.generateMap({ hires: true }),
    };
  }
};

const transformerEmptyBlock = (): SourceCodeTransformer => {
  return {
    name: '@penxle/lib/unocss:transformer-empty-block',
    enforce: 'pre',
    transform: (code) => {
      // 마크업에 element가 없는 svelte 파일의 경우 *{} 가 잘못된 최적화로 {} 로 바뀌는데, 이를 다시 *{} 로 고침.
      code.replaceAll('}{}', '}*{}');
    },
  };
};
