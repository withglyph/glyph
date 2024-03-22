import { pgEnum } from 'drizzle-orm/pg-core';

export const UserRole = pgEnum('_user_role', ['ADMIN', 'USER']);
export const PostAgeRating = pgEnum('_post_age_rating', ['ALL', 'R15', 'R19']);
export const PostPair = pgEnum('_post_pair', ['BL', 'GL', 'HL', 'MULTIPLE', 'NONCP', 'OTHER']);
export const PostTagKind = pgEnum('_post_tag_kind', ['TITLE', 'COUPLING', 'CHARACTER', 'TRIGGER', 'EXTRA']);
export const UserSingleSignOnProvider = pgEnum('_user_single_sign_on_provider', ['TWITTER', 'GOOGLE', 'NAVER']);
export const PostCommentQualification = pgEnum('_post_comment_qualification', ['NONE', 'IDENTIFIED', 'ANY']);
export const UserNotificationState = pgEnum('_user_notification_state', ['UNREAD', 'READ']);
export const ContentFilterAction = pgEnum('_content_filter_action', ['WARN', 'EXPOSE']);
export const PaymentMethod = pgEnum('_payment_method', [
  'CREDIT_CARD',
  'BANK_ACCOUNT',
  'VIRTUAL_BANK_ACCOUNT',
  'PHONE_BILL',
  'GIFTCARD_CULTURELAND',
  'GIFTCARD_SMARTCULTURE',
  'GIFTCARD_BOOKNLIFE',
  'PAYPAL',
]);
export const PointKind = pgEnum('_point_kind', ['PAID', 'FREE']);
export const PointPurchaseState = pgEnum('_point_purchase_state', ['PENDING', 'COMPLETED', 'FAILED', 'UNDONE']);
export const PointTransactionCause = pgEnum('_point_transaction_cause', [
  'INTERNAL',
  'PURCHASE',
  'UNDO_PURCHASE',
  'REFUND',
  'EXPIRE',
  'UNLOCK_CONTENT',
  'PATRONIZE',
  'EVENT_REWARD',
]);
export const PostRevisionKind = pgEnum('_post_revision_kind', ['AUTO_SAVE', 'MANUAL_SAVE', 'PUBLISHED', 'ARCHIVED']);
export const PostRevisionContentKind = pgEnum('_post_revision_content_kind', ['ARTICLE', 'GALLERY']);
export const PostState = pgEnum('_post_state', ['DRAFT', 'PUBLISHED', 'DELETED', 'EPHEMERAL']);
export const PostVisibility = pgEnum('_post_visibility', ['PUBLIC', 'SPACE', 'UNLISTED']);
export const PreferenceType = pgEnum('_preference_type', ['FAVORITE', 'MUTE']);
export const SpaceCollectionState = pgEnum('_space_collection_state', ['ACTIVE', 'INACTIVE']);
export const SpaceMemberInvitationState = pgEnum('_space_member_invitation_state', ['PENDING', 'ACCEPTED', 'IGNORED']);
export const SpaceMemberRole = pgEnum('_space_member_role', ['ADMIN', 'MEMBER']);
export const SpaceMemberState = pgEnum('_space_member_state', ['ACTIVE', 'INACTIVE']);
export const SpaceState = pgEnum('_space_state', ['ACTIVE', 'INACTIVE']);
export const SpaceVisibility = pgEnum('_space_visibility', ['PUBLIC', 'PRIVATE']);
export const UserEmailVerificationKind = pgEnum('_user_email_verification_kind', ['USER_LOGIN', 'USER_EMAIL_UPDATE']);
export const PostCategory = pgEnum('_post_category', ['ORIGINAL', 'FANFICTION', 'NONFICTION', 'OTHER']);
export const RevenueWithdrawalState = pgEnum('_revenue_withdrawal_state', ['PENDING', 'SUCCESS', 'FAILED']);
export const UserNotificationCategory = pgEnum('_user_notification_category', [
  'COMMENT',
  'REPLY',
  'SUBSCRIBE',
  'TAG_EDIT',
  'TREND',
  'PURCHASE',
  'DONATE',
  'TAG_WIKI_EDIT',
  'ALL',
]);
export const UserNotificationMethod = pgEnum('_user_notification_method', ['EMAIL', 'WEBSITE']);
export const UserState = pgEnum('_user_state', ['ACTIVE', 'INACTIVE']);
export const ContentFilterCategory = pgEnum('_content_filter_category', [
  'ADULT',
  'VIOLENCE',
  'CRUELTY',
  'HORROR',
  'GAMBLING',
  'TRAUMA',
  'CRIME',
  'PHOBIA',
  'INSULT',
  'GROSSNESS',
  'OTHER',
]);
export const RevenueKind = pgEnum('_revenue_kind', ['POST_PURCHASE', 'POST_PATRONAGE']);
export const RevenueState = pgEnum('_revenue_state', ['PENDING', 'INVOICED', 'PAID']);
export const UserPersonalIdentityKind = pgEnum('_user_personal_identity_kind', ['PHONE', 'PASSPORT']);
export const PostCommentState = pgEnum('_post_comment_state', ['ACTIVE', 'INACTIVE']);
export const PostCommentVisibility = pgEnum('_post_comment_visibility', ['PUBLIC', 'PRIVATE']);
export const RevenueWithdrawalKind = pgEnum('_revenue_withdrawal_kind', ['INSTANT', 'MONTHLY']);
