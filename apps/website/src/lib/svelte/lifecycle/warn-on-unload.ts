import { dev } from '$app/environment';
import { beforeNavigate } from '$app/navigation';

type WarnOnUnloadOptions = {
  message?: string;
};

export const warnOnUnload = (options?: WarnOnUnloadOptions) => {
  const message = options?.message ?? '작성된 내용이 사라져요. 정말로 떠나시겠어요?';

  beforeNavigate(({ cancel, willUnload }) => {
    // 개발환경에서는 무시 (HMR이 귀찮아짐)
    if (dev) {
      return;
    }

    // 새로고침이나 외부링크 등 사이트를 아예 벗어나는 경우 willUnload가 true
    // window.onbeforeunload 이벤트를 타는데 이때는 유저한테 보여지는 메시지를 따로 지정할 수 없음
    if (willUnload) {
      cancel();
      return;
    }

    // CSR 라우팅인 경우 지정된 메시지로 confirm 띄우고 확인받음
    if (!confirm(message)) {
      cancel();
      return;
    }
  });
};
