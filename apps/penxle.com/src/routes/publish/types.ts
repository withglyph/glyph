import type { ContentFilterCategory, PostVisibility } from '@prisma/client';

export type PublishPage_Header_PostOption = {
  contentFilters: ContentFilterCategory[];
  discloseStats?: boolean;
  hasPassword: boolean;
  postId: string;
  receiveFeedback?: boolean;
  receivePatronage?: boolean;
  receiveTagContribution?: boolean;
  tags?: string[];
  visibility: PostVisibility;
};
