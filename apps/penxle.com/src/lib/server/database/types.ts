import type { Generated } from 'kysely';

export type BookmarkPosts = {
  id: string;
  bookmarkId: string;
  postId: string;
  createdAt: Generated<Date>;
};

export type Bookmarks = {
  id: string;
  userId: string;
  name: string;
  createdAt: Generated<Date>;
};

export type Embeds = {
  id: string;
  type: string;
  description: string | null;
  html: string | null;
  thumbnailUrl: string | null;
  title: string | null;
  url: string;
  createdAt: Generated<Date>;
};

export type Files = {
  createdAt: Generated<Date>;
  format: string;
  id: string;
  name: string;
  path: string;
  size: number;
  userId: string;
};

export type Images = {
  color: string;
  createdAt: Generated<Date>;
  format: string;
  hash: string;
  height: number;
  id: string;
  name: string;
  path: string;
  placeholder: string;
  size: number;
  userId: string | null;
  width: number;
};

export type PointBalances = {
  createdAt: Generated<Date>;
  expiresAt: Date;
  id: string;
  initial: number;
  kind: 'FREE' | 'PAID';
  leftover: number;
  purchaseId: string | null;
  userId: string;
};

export type PointPurchases = {
  completedAt: Date | null;
  createdAt: Generated<Date>;
  expiresAt: Date;
  id: string;
  paymentAmount: number;
  paymentData: unknown;
  paymentKey: string;
  paymentMethod:
    | 'BANK_ACCOUNT'
    | 'CREDIT_CARD'
    | 'GIFTCARD_BOOKNLIFE'
    | 'GIFTCARD_CULTURELAND'
    | 'GIFTCARD_SMARTCULTURE'
    | 'PAYPAL'
    | 'PHONE_BILL'
    | 'VIRTUAL_BANK_ACCOUNT';
  paymentResult: unknown;
  pointAmount: number;
  state: 'COMPLETED' | 'FAILED' | 'PENDING' | 'UNDONE';
  userId: string;
};

export type PointTransactions = {
  amount: number;
  cause:
    | 'EVENT_REWARD'
    | 'EXPIRE'
    | 'INTERNAL'
    | 'PATRONIZE'
    | 'PURCHASE'
    | 'REFUND'
    | 'UNDO_PURCHASE'
    | 'UNLOCK_CONTENT';
  createdAt: Generated<Date>;
  id: string;
  targetId: string | null;
  userId: string;
};

export type PostCommentLikes = {
  commentId: string;
  createdAt: Generated<Date>;
  id: string;
  profileId: string;
  userId: string;
};

export type PostComments = {
  content: string;
  createdAt: Generated<Date>;
  id: string;
  parentId: string | null;
  pinned: Generated<boolean>;
  postId: string;
  profileId: string;
  state: 'ACTIVE' | 'INACTIVE';
  updatedAt: Date | null;
  userId: string;
  visibility: 'PRIVATE' | 'PUBLIC';
};

export type PostLikes = {
  createdAt: Generated<Date>;
  id: string;
  postId: string;
  userId: string;
};

export type PostPurchases = {
  createdAt: Generated<Date>;
  id: string;
  pointAmount: Generated<number>;
  postId: string;
  revisionId: string;
  userId: string;
};

export type PostReactions = {
  createdAt: Generated<Date>;
  emoji: string;
  id: string;
  postId: string;
  userId: string;
};

export type PostRevisionContents = {
  createdAt: Generated<Date>;
  data: unknown;
  hash: string;
  id: string;
};

export type PostRevisions = {
  createdAt: Generated<Date>;
  freeContentId: string | null;
  id: string;
  kind: 'ARCHIVED' | 'AUTO_SAVE' | 'MANUAL_SAVE' | 'PUBLISHED';
  paidContentId: string | null;
  paragraphIndent: Generated<number>;
  paragraphSpacing: Generated<number>;
  postId: string;
  price: number | null;
  subtitle: string | null;
  title: string | null;
  updatedAt: Generated<Date>;
  userId: string;
};

export type Posts = {
  ageRating: 'ALL' | 'R15' | 'R19';
  category: 'FANFICTION' | 'NONFICTION' | 'ORIGINAL' | 'OTHER';
  commentQualification: 'ANY' | 'IDENTIFIED' | 'NONE';
  createdAt: Generated<Date>;
  discloseStats: boolean;
  externalSearchable: Generated<boolean>;
  id: string;
  memberId: string | null;
  pairs: Generated<ArrayType<_PostPair> | null>;
  password: string | null;
  permalink: string;
  protectContent: Generated<boolean>;
  publishedAt: Date | null;
  publishedRevisionId: string | null;
  receiveFeedback: boolean;
  receivePatronage: boolean;
  receiveTagContribution: boolean;
  spaceId: string | null;
  state: ArrayType<'DELETED' | 'DRAFT' | 'EPHEMERAL' | 'PUBLISHED'>;
  thumbnailId: string | null;
  userId: string;
  visibility: ArrayType<'PUBLIC' | 'SPACE' | 'UNLISTED'>;
};

export type PostTags = {
  createdAt: Generated<Date>;
  id: string;
  kind: ArrayType<'CHARACTER' | 'COUPLING' | 'EXTRA' | 'TITLE' | 'TRIGGER'>;
  postId: string;
  tagId: string;
};

export type PostViews = {
  createdAt: Generated<Date>;
  deviceId: string;
  id: string;
  postId: string;
  userId: string | null;
  viewedAt: Generated<Date>;
};

export type Profiles = {
  avatarId: string;
  createdAt: Generated<Date>;
  id: string;
  name: string;
};

export type ProvisionedUsers = {
  avatarUrl: string | null;
  createdAt: Generated<Date>;
  email: string;
  id: string;
  name: string | null;
  principal: string | null;
  provider: ArrayType<'GOOGLE' | 'NAVER' | 'TWITTER'> | null;
  token: string;
};

export type Revenues = {
  amount: number;
  createdAt: Generated<Date>;
  id: string;
  kind: ArrayType<'POST_PATRONAGE' | 'POST_PURCHASE'>;
  state: ArrayType<'INVOICED' | 'PAID' | 'PENDING'>;
  targetId: string | null;
  userId: string;
  withdrawalId: string | null;
};

export type RevenueWithdrawals = {
  bankAccountNumber: string;
  bankCode: string;
  createdAt: Generated<Date>;
  id: string;
  kind: ArrayType<'INSTANT' | 'MONTHLY'>;
  paidAmount: number;
  revenueAmount: number;
  serviceFeeAmount: number;
  state: Generated<ArrayType<'FAILED' | 'PENDING' | 'SUCCESS'>>;
  taxAmount: number;
  taxBaseAmount: number;
  totalFeeAmount: number;
  txId: string | null;
  userId: string;
  withdrawalFeeAmount: number;
};

export type SpaceCollectionPosts = {
  collectionId: string;
  createdAt: Generated<Date>;
  id: string;
  order: number;
  postId: string;
};

export type SpaceCollections = {
  createdAt: Generated<Date>;
  id: string;
  name: string;
  spaceId: string;
  state: ArrayType<'ACTIVE' | 'INACTIVE'>;
  thumbnailId: string | null;
};

export type SpaceExternalLinks = {
  createdAt: Generated<Date>;
  id: string;
  spaceId: string;
  url: string;
};

export type SpaceFollows = {
  createdAt: Generated<Date>;
  id: string;
  spaceId: string;
  userId: string;
};

export type SpaceMasquerades = {
  blockedAt: Date | null;
  createdAt: Generated<Date>;
  id: string;
  profileId: string;
  spaceId: string;
  userId: string;
};

export type SpaceMemberInvitations = {
  createdAt: Generated<Date>;
  id: string;
  receivedEmail: string;
  receivedUserId: string | null;
  respondedAt: Date | null;
  role: ArrayType<'ADMIN' | 'MEMBER'>;
  sentUserId: string;
  spaceId: string;
  state: ArrayType<'ACCEPTED' | 'IGNORED' | 'PENDING'>;
};

export type SpaceMembers = {
  createdAt: Generated<Date>;
  id: string;
  profileId: string;
  role: ArrayType<'ADMIN' | 'MEMBER'>;
  spaceId: string;
  state: ArrayType<'ACTIVE' | 'INACTIVE'>;
  userId: string;
};

export type Spaces = {
  createdAt: Generated<Date>;
  description: string | null;
  iconId: string;
  id: string;
  name: string;
  slug: string;
  state: ArrayType<'ACTIVE' | 'INACTIVE'>;
  visibility: ArrayType<'PRIVATE' | 'PUBLIC'>;
};

export type SpaceUserBlocks = {
  createdAt: Generated<Date>;
  id: string;
  reason: string | null;
  spaceId: string;
  userId: string;
};

export type TagFollows = {
  createdAt: Generated<Date>;
  id: string;
  tagId: string;
  userId: string;
};

export type TagHierarchies = {
  childTagId: string;
  createdAt: Generated<Date>;
  id: string;
  parentTagId: string;
};

export type Tags = {
  createdAt: Generated<Date>;
  id: string;
  name: string;
};

export type TagWikiRevisions = {
  content: string;
  createdAt: Generated<Date>;
  id: string;
  tagWikiId: string;
  userId: string;
};

export type TagWikis = {
  createdAt: Generated<Date>;
  id: string;
  tagId: string;
};

export type UserContentFilterPreferences = {
  action: ArrayType<'EXPOSE' | 'WARN'>;
  category: ArrayType<
    | 'ADULT'
    | 'CRIME'
    | 'CRUELTY'
    | 'GAMBLING'
    | 'GROSSNESS'
    | 'HORROR'
    | 'INSULT'
    | 'OTHER'
    | 'PHOBIA'
    | 'TRAUMA'
    | 'VIOLENCE'
  >;
  createdAt: Generated<Date>;
  id: string;
  userId: string;
};

export type UserEmailVerifications = {
  code: string | null;
  createdAt: Generated<Date>;
  email: string;
  expiresAt: Date;
  id: string;
  kind: ArrayType<'USER_EMAIL_UPDATE' | 'USER_LOGIN'>;
  token: string;
  userId: string | null;
};

export type UserEventEnrollments = {
  createdAt: Generated<Date>;
  eligible: boolean;
  eventCode: string;
  id: string;
  rewardedAt: Date | null;
  userId: string;
};

export type UserMarketingConsents = {
  createdAt: Generated<Date>;
  id: string;
  userId: string;
};

export type UserNotificationPreferences = {
  category: ArrayType<
    'ALL' | 'COMMENT' | 'DONATE' | 'PURCHASE' | 'REPLY' | 'SUBSCRIBE' | 'TAG_EDIT' | 'TAG_WIKI_EDIT' | 'TREND'
  >;
  createdAt: Generated<Date>;
  id: string;
  method: ArrayType<'EMAIL' | 'WEBSITE'>;
  opted: boolean;
  userId: string;
};

export type UserNotifications = {
  actorId: string | null;
  category: ArrayType<
    'ALL' | 'COMMENT' | 'DONATE' | 'PURCHASE' | 'REPLY' | 'SUBSCRIBE' | 'TAG_EDIT' | 'TAG_WIKI_EDIT' | 'TREND'
  >;
  createdAt: Generated<Date>;
  data: Json | null;
  id: string;
  state: ArrayType<'READ' | 'UNREAD'>;
  userId: string;
};

export type UserPersonalIdentities = {
  birthday: Date;
  ci: string;
  createdAt: Generated<Date>;
  id: string;
  kind: Generated<ArrayType<'PASSPORT' | 'PHONE'>>;
  name: string;
  phoneNumber: string | null;
  userId: string;
};

export type Users = {
  createdAt: Generated<Date>;
  email: string;
  id: string;
  profileId: string;
  role: Generated<ArrayType<'ADMIN' | 'USER'>>;
  state: ArrayType<'ACTIVE' | 'INACTIVE'>;
};

export type UserSessions = {
  createdAt: Generated<Date>;
  id: string;
  userId: string;
};

export type UserSettlementIdentities = {
  bankAccountHolderName: string;
  bankAccountNumber: string;
  bankCode: string;
  encryptedResidentRegistrationNumber: string;
  encryptedResidentRegistrationNumberNonce: string;
  id: string;
  residentRegistrationNumberHash: string;
  userId: string;
};

export type UserSingleSignOns = {
  createdAt: Generated<Date>;
  email: string;
  id: string;
  principal: string;
  provider: ArrayType<'GOOGLE' | 'NAVER' | 'TWITTER'>;
  userId: string;
};

export type UserSpaceMutes = {
  createdAt: Generated<Date>;
  id: string;
  spaceId: string;
  userId: string;
};

export type UserTagMute = {
  createdAt: Generated<Date>;
  id: string;
  tagId: string;
  userId: string;
};

export type UserWithdrawalConfigs = {
  id: string;
  monthlyWithdrawalEnabled: Generated<boolean>;
  userId: string;
};

export type DB = {
  bookmarkPosts: BookmarkPosts;
  bookmarks: Bookmarks;
  embeds: Embeds;
  files: Files;
  images: Images;
  pointBalances: PointBalances;
  pointPurchases: PointPurchases;
  pointTransactions: PointTransactions;
  postCommentLikes: PostCommentLikes;
  postComments: PostComments;
  postLikes: PostLikes;
  postPurchases: PostPurchases;
  postReactions: PostReactions;
  postRevisionContents: PostRevisionContents;
  postRevisions: PostRevisions;
  posts: Posts;
  postTags: PostTags;
  postViews: PostViews;
  profiles: Profiles;
  provisionedUsers: ProvisionedUsers;
  revenues: Revenues;
  revenueWithdrawals: RevenueWithdrawals;
  spaceCollectionPosts: SpaceCollectionPosts;
  spaceCollections: SpaceCollections;
  spaceExternalLinks: SpaceExternalLinks;
  spaceFollows: SpaceFollows;
  spaceMasquerades: SpaceMasquerades;
  spaceMemberInvitations: SpaceMemberInvitations;
  spaceMembers: SpaceMembers;
  spaces: Spaces;
  spaceUserBlocks: SpaceUserBlocks;
  tagFollows: TagFollows;
  tagHierarchies: TagHierarchies;
  tags: Tags;
  tagWikiRevisions: TagWikiRevisions;
  tagWikis: TagWikis;
  userContentFilterPreferences: UserContentFilterPreferences;
  userEmailVerifications: UserEmailVerifications;
  userEventEnrollments: UserEventEnrollments;
  userMarketingConsents: UserMarketingConsents;
  userNotificationPreferences: UserNotificationPreferences;
  userNotifications: UserNotifications;
  userPersonalIdentities: UserPersonalIdentities;
  users: Users;
  userSessions: UserSessions;
  userSettlementIdentities: UserSettlementIdentities;
  userSingleSignOns: UserSingleSignOns;
  userSpaceMutes: UserSpaceMutes;
  userTagMute: UserTagMute;
  userWithdrawalConfigs: UserWithdrawalConfigs;
};
