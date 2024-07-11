import { notificationMaker } from '$lib/notification/maker';
import { defineJob } from './types';

type CreateNotificationParams = {
  category: keyof typeof notificationMaker;
  targetId: string;
};

export const createNotificationJob = defineJob(
  'createNotification',
  async ({ category, targetId }: CreateNotificationParams) => {
    const maker = notificationMaker[category];
    await maker(targetId);
  },
);
