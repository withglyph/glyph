import { beforeNavigate } from '$app/navigation';

type WarnOnUnloadOptions = {
  message?: string;
};

export const warnOnUnload = (options?: WarnOnUnloadOptions) => {
  const message =
    options?.message ?? '작성된 내용이 사라져요. 정말로 떠나시겠어요?';

  beforeNavigate(({ cancel, willUnload }) => {
    if (willUnload) {
      cancel();
      return;
    }

    if (!confirm(message)) {
      cancel();
      return;
    }
  });
};
