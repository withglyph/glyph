import { optimize } from 'svgo';

export const optimizeSvg = (svg: string) => {
  const { data } = optimize(svg, {
    multipass: true,
    plugins: [
      {
        name: 'preset-default',
        params: { overrides: { inlineStyles: { onlyMatchedOnce: false } } },
      },
      'convertStyleToAttrs',
    ],
  });

  return data;
};
