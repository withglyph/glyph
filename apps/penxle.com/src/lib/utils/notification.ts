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

export type Notification = (PurchaseNotification | SubscribeNotification) & {
  userId: string;
};
