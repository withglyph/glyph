import type { GraphCacheConfig } from '$glitch';

export const keys: GraphCacheConfig['keys'] = {
  UserContentFilterPreference: () => null,
  UserNotificationPreference: () => null,
};
