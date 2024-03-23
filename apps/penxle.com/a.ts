import type { ColumnType } from "kysely";

export type _PostPair = "BL" | "GL" | "HL" | "MULTIPLE" | "NONCP" | "OTHER";

export type ArrayType<T> = ArrayTypeImpl<T> extends (infer U)[]
  ? U[]
  : ArrayTypeImpl<T>;

export type ArrayTypeImpl<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S[], I[], U[]>
  : T[];

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<string, bigint | number | string, bigint | number | string>;

export type Json = JsonValue;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface BookmarkPosts {
  bookmarkId: string;
  createdAt: Generated<Timestamp>;
  id: string;
  postId: string;
}

export interface Bookmarks {
  createdAt: Generated<Timestamp>;
  id: string;
  name: string;
  userId: string;
}

export interface DrizzleDrizzleMigrations {
  createdAt: Int8 | null;
  hash: string;
  id: Generated<number>;
}

export interface Embeds {
  createdAt: Generated<Timestamp>;
  description: string | null;
  html: string | null;
  id: string;
  thumbnailUrl: string | null;
  title: string | null;
  type: string;
  url: string;
}

export interface Files {
  createdAt: Generated<Timestamp>;
  format: string;
  id: string;
  name: string;
  path: string;
  size: number;
  userId: string;
}

export interface Images {
  color: string;
  createdAt: Generated<Timestamp>;
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
}

export interface PointBalances {
  createdAt: Generated<Timestamp>;
  expiresAt: Timestamp;
  id: string;
  initial: number;
  kind: ArrayType<"FREE" | "PAID">;
  leftover: number;
  purchaseId: string | null;
  userId: string;
}

export interface PointPurchases {
  completedAt: Timestamp | null;
  createdAt: Generated<Timestamp>;
  expiresAt: Timestamp;
  id: string;
  paymentAmount: number;
  paymentData: Json;
  paymentKey: string;
  paymentMethod: ArrayType<"BANK_ACCOUNT" | "CREDIT_CARD" | "GIFTCARD_BOOKNLIFE" | "GIFTCARD_CULTURELAND" | "GIFTCARD_SMARTCULTURE" | "PAYPAL" | "PHONE_BILL" | "VIRTUAL_BANK_ACCOUNT">;
  paymentResult: Json | null;
  pointAmount: number;
  state: ArrayType<"COMPLETED" | "FAILED" | "PENDING" | "UNDONE">;
  userId: string;
}

export interface PointTransactions {
  amount: number;
  cause: ArrayType<"EVENT_REWARD" | "EXPIRE" | "INTERNAL" | "PATRONIZE" | "PURCHASE" | "REFUND" | "UNDO_PURCHASE" | "UNLOCK_CONTENT">;
  createdAt: Generated<Timestamp>;
  id: string;
  targetId: string | null;
  userId: string;
}

export interface PostCommentLikes {
  commentId: string;
  createdAt: Generated<Timestamp>;
  id: string;
  profileId: string;
  userId: string;
}

export interface PostComments {
  content: string;
  createdAt: Generated<Timestamp>;
  id: string;
  parentId: string | null;
  pinned: Generated<boolean>;
  postId: string;
  profileId: string;
  state: ArrayType<"ACTIVE" | "INACTIVE">;
  updatedAt: Timestamp | null;
  userId: string;
  visibility: ArrayType<"PRIVATE" | "PUBLIC">;
}

export interface PostLikes {
  createdAt: Generated<Timestamp>;
  id: string;
  postId: string;
  userId: string;
}

export interface PostPurchases {
  createdAt: Generated<Timestamp>;
  id: string;
  pointAmount: Generated<number>;
  postId: string;
  revisionId: string;
  userId: string;
}

export interface PostReactions {
  createdAt: Generated<Timestamp>;
  emoji: string;
  id: string;
  postId: string;
  userId: string;
}

export interface PostRevisionContents {
  createdAt: Generated<Timestamp>;
  data: Json;
  hash: string;
  id: string;
}

export interface PostRevisions {
  createdAt: Generated<Timestamp>;
  freeContentId: string | null;
  id: string;
  kind: ArrayType<"ARCHIVED" | "AUTO_SAVE" | "MANUAL_SAVE" | "PUBLISHED">;
  paidContentId: string | null;
  paragraphIndent: Generated<number>;
  paragraphSpacing: Generated<number>;
  postId: string;
  price: number | null;
  subtitle: string | null;
  title: string | null;
  updatedAt: Generated<Timestamp>;
  userId: string;
}

export interface Posts {
  ageRating: Generated<ArrayType<"ALL" | "R15" | "R19">>;
  category: Generated<ArrayType<"FANFICTION" | "NONFICTION" | "ORIGINAL" | "OTHER">>;
  commentQualification: Generated<ArrayType<"ANY" | "IDENTIFIED" | "NONE">>;
  createdAt: Generated<Timestamp>;
  discloseStats: boolean;
  externalSearchable: Generated<boolean>;
  id: string;
  memberId: string | null;
  pairs: Generated<ArrayType<_PostPair> | null>;
  password: string | null;
  permalink: string;
  protectContent: Generated<boolean>;
  publishedAt: Timestamp | null;
  publishedRevisionId: string | null;
  receiveFeedback: boolean;
  receivePatronage: boolean;
  receiveTagContribution: boolean;
  spaceId: string | null;
  state: ArrayType<"DELETED" | "DRAFT" | "EPHEMERAL" | "PUBLISHED">;
  thumbnailId: string | null;
  userId: string;
  visibility: ArrayType<"PUBLIC" | "SPACE" | "UNLISTED">;
}

export interface PostTags {
  createdAt: Generated<Timestamp>;
  id: string;
  kind: ArrayType<"CHARACTER" | "COUPLING" | "EXTRA" | "TITLE" | "TRIGGER">;
  postId: string;
  tagId: string;
}

export interface PostViews {
  createdAt: Generated<Timestamp>;
  deviceId: string;
  id: string;
  postId: string;
  userId: string | null;
  viewedAt: Generated<Timestamp>;
}

export interface Profiles {
  avatarId: string;
  createdAt: Generated<Timestamp>;
  id: string;
  name: string;
}

export interface ProvisionedUsers {
  avatarUrl: string | null;
  createdAt: Generated<Timestamp>;
  email: string;
  id: string;
  name: string | null;
  principal: string | null;
  provider: ArrayType<"GOOGLE" | "NAVER" | "TWITTER"> | null;
  token: string;
}

export interface Revenues {
  amount: number;
  createdAt: Generated<Timestamp>;
  id: string;
  kind: ArrayType<"POST_PATRONAGE" | "POST_PURCHASE">;
  state: ArrayType<"INVOICED" | "PAID" | "PENDING">;
  targetId: string | null;
  userId: string;
  withdrawalId: string | null;
}

export interface RevenueWithdrawals {
  bankAccountNumber: string;
  bankCode: string;
  createdAt: Generated<Timestamp>;
  id: string;
  kind: ArrayType<"INSTANT" | "MONTHLY">;
  paidAmount: number;
  revenueAmount: number;
  serviceFeeAmount: number;
  state: Generated<ArrayType<"FAILED" | "PENDING" | "SUCCESS">>;
  taxAmount: number;
  taxBaseAmount: number;
  totalFeeAmount: number;
  txId: string | null;
  userId: string;
  withdrawalFeeAmount: number;
}

export interface SpaceCollectionPosts {
  collectionId: string;
  createdAt: Generated<Timestamp>;
  id: string;
  order: number;
  postId: string;
}

export interface SpaceCollections {
  createdAt: Generated<Timestamp>;
  id: string;
  name: string;
  spaceId: string;
  state: ArrayType<"ACTIVE" | "INACTIVE">;
  thumbnailId: string | null;
}

export interface SpaceExternalLinks {
  createdAt: Generated<Timestamp>;
  id: string;
  spaceId: string;
  url: string;
}

export interface SpaceFollows {
  createdAt: Generated<Timestamp>;
  id: string;
  spaceId: string;
  userId: string;
}

export interface SpaceMasquerades {
  blockedAt: Timestamp | null;
  createdAt: Generated<Timestamp>;
  id: string;
  profileId: string;
  spaceId: string;
  userId: string;
}

export interface SpaceMemberInvitations {
  createdAt: Generated<Timestamp>;
  id: string;
  receivedEmail: string;
  receivedUserId: string | null;
  respondedAt: Timestamp | null;
  role: ArrayType<"ADMIN" | "MEMBER">;
  sentUserId: string;
  spaceId: string;
  state: ArrayType<"ACCEPTED" | "IGNORED" | "PENDING">;
}

export interface SpaceMembers {
  createdAt: Generated<Timestamp>;
  id: string;
  profileId: string;
  role: ArrayType<"ADMIN" | "MEMBER">;
  spaceId: string;
  state: ArrayType<"ACTIVE" | "INACTIVE">;
  userId: string;
}

export interface Spaces {
  createdAt: Generated<Timestamp>;
  description: string | null;
  iconId: string;
  id: string;
  name: string;
  slug: string;
  state: ArrayType<"ACTIVE" | "INACTIVE">;
  visibility: ArrayType<"PRIVATE" | "PUBLIC">;
}

export interface SpaceUserBlocks {
  createdAt: Generated<Timestamp>;
  id: string;
  reason: string | null;
  spaceId: string;
  userId: string;
}

export interface TagFollows {
  createdAt: Generated<Timestamp>;
  id: string;
  tagId: string;
  userId: string;
}

export interface TagHierarchies {
  childTagId: string;
  createdAt: Generated<Timestamp>;
  id: string;
  parentTagId: string;
}

export interface Tags {
  createdAt: Generated<Timestamp>;
  id: string;
  name: string;
}

export interface TagWikiRevisions {
  content: string;
  createdAt: Generated<Timestamp>;
  id: string;
  tagWikiId: string;
  userId: string;
}

export interface TagWikis {
  createdAt: Generated<Timestamp>;
  id: string;
  tagId: string;
}

export interface UserContentFilterPreferences {
  action: ArrayType<"EXPOSE" | "WARN">;
  category: ArrayType<"ADULT" | "CRIME" | "CRUELTY" | "GAMBLING" | "GROSSNESS" | "HORROR" | "INSULT" | "OTHER" | "PHOBIA" | "TRAUMA" | "VIOLENCE">;
  createdAt: Generated<Timestamp>;
  id: string;
  userId: string;
}

export interface UserEmailVerifications {
  code: string | null;
  createdAt: Generated<Timestamp>;
  email: string;
  expiresAt: Timestamp;
  id: string;
  kind: ArrayType<"USER_EMAIL_UPDATE" | "USER_LOGIN">;
  token: string;
  userId: string | null;
}

export interface UserEventEnrollments {
  createdAt: Generated<Timestamp>;
  eligible: boolean;
  eventCode: string;
  id: string;
  rewardedAt: Timestamp | null;
  userId: string;
}

export interface UserMarketingConsents {
  createdAt: Generated<Timestamp>;
  id: string;
  userId: string;
}

export interface UserNotificationPreferences {
  category: ArrayType<"ALL" | "COMMENT" | "DONATE" | "PURCHASE" | "REPLY" | "SUBSCRIBE" | "TAG_EDIT" | "TAG_WIKI_EDIT" | "TREND">;
  createdAt: Generated<Timestamp>;
  id: string;
  method: ArrayType<"EMAIL" | "WEBSITE">;
  opted: boolean;
  userId: string;
}

export interface UserNotifications {
  actorId: string | null;
  category: ArrayType<"ALL" | "COMMENT" | "DONATE" | "PURCHASE" | "REPLY" | "SUBSCRIBE" | "TAG_EDIT" | "TAG_WIKI_EDIT" | "TREND">;
  createdAt: Generated<Timestamp>;
  data: Json | null;
  id: string;
  state: ArrayType<"READ" | "UNREAD">;
  userId: string;
}

export interface UserPersonalIdentities {
  birthday: Timestamp;
  ci: string;
  createdAt: Generated<Timestamp>;
  id: string;
  kind: Generated<ArrayType<"PASSPORT" | "PHONE">>;
  name: string;
  phoneNumber: string | null;
  userId: string;
}

export interface Users {
  createdAt: Generated<Timestamp>;
  email: string;
  id: string;
  profileId: string;
  role: Generated<ArrayType<"ADMIN" | "USER">>;
  state: ArrayType<"ACTIVE" | "INACTIVE">;
}

export interface UserSessions {
  createdAt: Generated<Timestamp>;
  id: string;
  userId: string;
}

export interface UserSettlementIdentities {
  bankAccountHolderName: string;
  bankAccountNumber: string;
  bankCode: string;
  encryptedResidentRegistrationNumber: string;
  encryptedResidentRegistrationNumberNonce: string;
  id: string;
  residentRegistrationNumberHash: string;
  userId: string;
}

export interface UserSingleSignOns {
  createdAt: Generated<Timestamp>;
  email: string;
  id: string;
  principal: string;
  provider: ArrayType<"GOOGLE" | "NAVER" | "TWITTER">;
  userId: string;
}

export interface UserSpaceMutes {
  createdAt: Generated<Timestamp>;
  id: string;
  spaceId: string;
  userId: string;
}

export interface UserTagMute {
  createdAt: Generated<Timestamp>;
  id: string;
  tagId: string;
  userId: string;
}

export interface UserWithdrawalConfigs {
  id: string;
  monthlyWithdrawalEnabled: Generated<boolean>;
  userId: string;
}

export interface DB {
  bookmarkPosts: BookmarkPosts;
  bookmarks: Bookmarks;
  "drizzle.DrizzleMigrations": DrizzleDrizzleMigrations;
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
}
