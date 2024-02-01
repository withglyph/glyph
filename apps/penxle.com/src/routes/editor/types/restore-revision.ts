import type { PostRevisionContentKind, PostRevisionKind } from '$glitch';

export type RestoredRevision =
  | {
      id: string;
      kind: PostRevisionKind;
      contentKind: PostRevisionContentKind;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      content: any;
      title: string;
      subtitle?: string | null | undefined;
    }
  | null
  | undefined;
