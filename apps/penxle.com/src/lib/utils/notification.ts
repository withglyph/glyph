type PurchaseNotification = {
  category: 'PURCHASE';
  actorId: string;
  data: {
    postId: string;
  };
};

type SubscribeNotification = {
  category: 'SUBSCRIBE';
  actorId: string;
  data: {
    spaceId: string;
  };
};

type CommentNotification = {
  category: 'COMMENT';
  actorId: string;
  data: {
    commentId: string;
  };
};

export type Notification = (PurchaseNotification | SubscribeNotification | CommentNotification) & {
  userId: string;
};
