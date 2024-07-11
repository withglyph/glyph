import { commentNotificationMaker } from './comment';
import { emojiReactionNotificationMaker } from './emoji-reaction';
import { purchaseNotificationMaker } from './purchase';
import { subscribeNotificationMaker } from './subscribe';

export const notificationMaker = {
  EMOJI_REACTION: emojiReactionNotificationMaker,
  COMMENT: commentNotificationMaker,
  PURCHASE: purchaseNotificationMaker,
  SUBSCRIBE: subscribeNotificationMaker,
};
