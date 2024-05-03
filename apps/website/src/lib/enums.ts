export type AuthScope = keyof typeof AuthScope;
export const AuthScope = {
  USER: 'USER',
  STAFF: 'STAFF',
} as const;

export type ContentFilterAction = keyof typeof ContentFilterAction;
export const ContentFilterAction = {
  EXPOSE: 'EXPOSE',
  WARN: 'WARN',
} as const;

export type ContentFilterCategory = keyof typeof ContentFilterCategory;
export const ContentFilterCategory = {
  ADULT: 'ADULT',
  CRIME: 'CRIME',
  CRUELTY: 'CRUELTY',
  GAMBLING: 'GAMBLING',
  GROSSNESS: 'GROSSNESS',
  HORROR: 'HORROR',
  INSULT: 'INSULT',
  OTHER: 'OTHER',
  PHOBIA: 'PHOBIA',
  TRAUMA: 'TRAUMA',
  VIOLENCE: 'VIOLENCE',
} as const;

export type FeatureFlag = keyof typeof FeatureFlag;
export const FeatureFlag = {
  SHOW_AD: 'SHOW_AD',
} as const;

export type PaymentMethod = keyof typeof PaymentMethod;
export const PaymentMethod = {
  BANK_ACCOUNT: 'BANK_ACCOUNT',
  CREDIT_CARD: 'CREDIT_CARD',
  GIFTCARD_BOOKNLIFE: 'GIFTCARD_BOOKNLIFE',
  GIFTCARD_CULTURELAND: 'GIFTCARD_CULTURELAND',
  GIFTCARD_SMARTCULTURE: 'GIFTCARD_SMARTCULTURE',
  PAYPAL: 'PAYPAL',
  PHONE_BILL: 'PHONE_BILL',
  VIRTUAL_BANK_ACCOUNT: 'VIRTUAL_BANK_ACCOUNT',
} as const;

export type PointKind = keyof typeof PointKind;
export const PointKind = {
  FREE: 'FREE',
  PAID: 'PAID',
} as const;

export type PointPurchaseState = keyof typeof PointPurchaseState;
export const PointPurchaseState = {
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
  UNDONE: 'UNDONE',
} as const;

export type PointTransactionCause = keyof typeof PointTransactionCause;
export const PointTransactionCause = {
  EVENT_REWARD: 'EVENT_REWARD',
  EXPIRE: 'EXPIRE',
  INTERNAL: 'INTERNAL',
  PATRONIZE: 'PATRONIZE',
  PURCHASE: 'PURCHASE',
  REFUND: 'REFUND',
  UNDO_PURCHASE: 'UNDO_PURCHASE',
  UNLOCK_CONTENT: 'UNLOCK_CONTENT',
} as const;

export type PostAgeRating = keyof typeof PostAgeRating;
export const PostAgeRating = {
  ALL: 'ALL',
  R15: 'R15',
  R19: 'R19',
} as const;

export type PostCategory = keyof typeof PostCategory;
export const PostCategory = {
  FANFICTION: 'FANFICTION',
  NONFICTION: 'NONFICTION',
  ORIGINAL: 'ORIGINAL',
  OTHER: 'OTHER',
} as const;

export type PostCommentQualification = keyof typeof PostCommentQualification;
export const PostCommentQualification = {
  ANY: 'ANY',
  IDENTIFIED: 'IDENTIFIED',
  NONE: 'NONE',
} as const;

export type PostCommentState = keyof typeof PostCommentState;
export const PostCommentState = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type PostCommentVisibility = keyof typeof PostCommentVisibility;
export const PostCommentVisibility = {
  PRIVATE: 'PRIVATE',
  PUBLIC: 'PUBLIC',
} as const;

export type PostPair = keyof typeof PostPair;
export const PostPair = {
  BL: 'BL',
  GL: 'GL',
  HL: 'HL',
  MULTIPLE: 'MULTIPLE',
  NONCP: 'NONCP',
  OTHER: 'OTHER',
} as const;

export type PostRevisionContentKind = keyof typeof PostRevisionContentKind;
export const PostRevisionContentKind = {
  ARTICLE: 'ARTICLE',
  GALLERY: 'GALLERY',
} as const;

export type PostRevisionKind = keyof typeof PostRevisionKind;
export const PostRevisionKind = {
  ARCHIVED: 'ARCHIVED',
  AUTO_SAVE: 'AUTO_SAVE',
  MANUAL_SAVE: 'MANUAL_SAVE',
  PUBLISHED: 'PUBLISHED',
} as const;

export type PostState = keyof typeof PostState;
export const PostState = {
  DELETED: 'DELETED',
  DRAFT: 'DRAFT',
  EPHEMERAL: 'EPHEMERAL',
  PUBLISHED: 'PUBLISHED',
} as const;

export type PostSynchronizationKind = keyof typeof PostSynchronizationKind;
export const PostSynchronizationKind = {
  PING: 'PING',
  UPDATE: 'UPDATE',
  SYNCHRONIZE_1: 'SYNCHRONIZE_1',
  SYNCHRONIZE_2: 'SYNCHRONIZE_2',
  SYNCHRONIZE_3: 'SYNCHRONIZE_3',
  AWARENESS: 'AWARENESS',
} as const;

export type PostTagKind = keyof typeof PostTagKind;
export const PostTagKind = {
  CHARACTER: 'CHARACTER',
  COUPLING: 'COUPLING',
  EXTRA: 'EXTRA',
  TITLE: 'TITLE',
  TRIGGER: 'TRIGGER',
} as const;

export type PostVisibility = keyof typeof PostVisibility;
export const PostVisibility = {
  PUBLIC: 'PUBLIC',
  SPACE: 'SPACE',
  UNLISTED: 'UNLISTED',
} as const;

export type PreferenceType = keyof typeof PreferenceType;
export const PreferenceType = {
  FAVORITE: 'FAVORITE',
  MUTE: 'MUTE',
} as const;

export type RevenueKind = keyof typeof RevenueKind;
export const RevenueKind = {
  POST_PATRONAGE: 'POST_PATRONAGE',
  POST_PURCHASE: 'POST_PURCHASE',
} as const;

export type RevenueState = keyof typeof RevenueState;
export const RevenueState = {
  INVOICED: 'INVOICED',
  PAID: 'PAID',
  PENDING: 'PENDING',
} as const;

export type RevenueWithdrawalKind = keyof typeof RevenueWithdrawalKind;
export const RevenueWithdrawalKind = {
  INSTANT: 'INSTANT',
  MONTHLY: 'MONTHLY',
} as const;

export type RevenueWithdrawalState = keyof typeof RevenueWithdrawalState;
export const RevenueWithdrawalState = {
  FAILED: 'FAILED',
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
} as const;

export type SpaceCollectionState = keyof typeof SpaceCollectionState;
export const SpaceCollectionState = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type SpaceMemberInvitationState = keyof typeof SpaceMemberInvitationState;
export const SpaceMemberInvitationState = {
  ACCEPTED: 'ACCEPTED',
  IGNORED: 'IGNORED',
  PENDING: 'PENDING',
} as const;

export type SpaceMemberRole = keyof typeof SpaceMemberRole;
export const SpaceMemberRole = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;

export type SpaceMemberState = keyof typeof SpaceMemberState;
export const SpaceMemberState = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type SpaceState = keyof typeof SpaceState;
export const SpaceState = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type SpaceVisibility = keyof typeof SpaceVisibility;
export const SpaceVisibility = {
  PRIVATE: 'PRIVATE',
  PUBLIC: 'PUBLIC',
} as const;

export type UserEmailVerificationKind = keyof typeof UserEmailVerificationKind;
export const UserEmailVerificationKind = {
  USER_EMAIL_UPDATE: 'USER_EMAIL_UPDATE',
  USER_LOGIN: 'USER_LOGIN',
} as const;

export type UserNotificationCategory = keyof typeof UserNotificationCategory;
export const UserNotificationCategory = {
  ALL: 'ALL',
  COMMENT: 'COMMENT',
  DONATE: 'DONATE',
  EMOJI_REACTION: 'EMOJI_REACTION',
  PURCHASE: 'PURCHASE',
  REPLY: 'REPLY',
  SUBSCRIBE: 'SUBSCRIBE',
  TAG_EDIT: 'TAG_EDIT',
  TAG_WIKI_EDIT: 'TAG_WIKI_EDIT',
  TREND: 'TREND',
} as const;

export type UserNotificationMethod = keyof typeof UserNotificationMethod;
export const UserNotificationMethod = {
  EMAIL: 'EMAIL',
  WEBSITE: 'WEBSITE',
} as const;

export type UserNotificationState = keyof typeof UserNotificationState;
export const UserNotificationState = {
  READ: 'READ',
  UNREAD: 'UNREAD',
} as const;

export type UserPersonalIdentityKind = keyof typeof UserPersonalIdentityKind;
export const UserPersonalIdentityKind = {
  PASSPORT: 'PASSPORT',
  PHONE: 'PHONE',
} as const;

export type UserSingleSignOnAuthorizationType = keyof typeof UserSingleSignOnAuthorizationType;
export const UserSingleSignOnAuthorizationType = {
  LINK: 'LINK',
  LOGIN: 'LOGIN',
} as const;

export type UserSingleSignOnProvider = keyof typeof UserSingleSignOnProvider;
export const UserSingleSignOnProvider = {
  GOOGLE: 'GOOGLE',
  NAVER: 'NAVER',
  TWITTER: 'TWITTER',
} as const;

export type UserState = keyof typeof UserState;
export const UserState = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type UserRole = keyof typeof UserRole;
export const UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;
