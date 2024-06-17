import type { RedeemCodeState } from '$glitch';

export const RedeemCodeStateString: Record<RedeemCodeState, string> = {
  AVAILABLE: '사용가능',
  EXPIRED: '만료됨',
  REVOKED: '취소됨',
  USED: '사용됨',
};
