import { micah } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { color } from '@penxle/unocss';
import { renderAsync } from '@resvg/resvg-js';
import { nanoid } from 'nanoid';
import { draw } from 'radash';
import { persistImage } from './image';
import type { Options } from '@dicebear/core';
import type { ColorShade } from '@penxle/unocss';
import type { InteractiveTransactionClient } from '../database';

const colors = (...colors: ColorShade[]) =>
  colors.map((v) => color(v).slice(1));

const backgroundColors = colors(
  'red-30',
  'yellow-30',
  'orange-30',
  'green-30',
  'blue-30',
  'purple-30',
);

const options: micah.Options & Options = {
  // 배경 (dicebear 버그로 첫번째 색상이 훨씬 높은 확률로 나오기에 직접 색칠함)
  backgroundColor: ['$$$$$$'],

  // 얼굴
  baseColor: ['FADCA9', 'EDB179', 'E09D57'], // https://theklog.co/korean-way-find-your-skin-tone/

  // 눈
  eyes: ['eyes', 'round', 'smiling', 'eyesShadow'],
  eyeShadowColor: colors('white'),
  eyebrows: ['up', 'down', 'eyelashesUp'],
  glassesColor: colors('gray-90', 'red-50'),

  // 입
  mouth: ['laughing', 'smile', 'smirk', 'surprised'],

  // 귀
  ears: ['detached'],
  earrings: [],

  // 털
  hair: ['dannyPhantom', 'fonze', 'full', 'pixie'],
  facialHair: [],
};

export const createRandomAvatar = () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const bg = draw(backgroundColors)!;
  return createAvatar(micah, {
    seed: nanoid(),
    ...options,
  })
    .toString()
    .replaceAll('$$$$$$', bg);
};

export const persistAvatar = async (
  db: InteractiveTransactionClient,
  avatar: string,
) => {
  const image = await renderAsync(avatar, {
    fitTo: { mode: 'width', value: 512 },
  });

  return await persistImage(db, 'avatar-generated.png', image.asPng());
};
