import type { ContentFilterCategory, PostCategory } from '$glitch';

export const filterToLocaleString: Record<ContentFilterCategory, string> = {
  ADULT: '성인물',
  CRIME: '약물/범죄',
  CRUELTY: '잔인성',
  GAMBLING: '사행성',
  GROSSNESS: '벌레/징그러움',
  HORROR: '공포성',
  INSULT: '언어의 부적절성',
  OTHER: '기타',
  PHOBIA: '정신질환/공포증',
  TRAUMA: '트라우마',
  VIOLENCE: '폭력성',
};

export const categoryFilter: Record<PostCategory, string> = {
  FANFICTION: '2차창작',
  NONFICTION: '비문학',
  ORIGINAL: '오리지널',
  OTHER: '기타',
};
