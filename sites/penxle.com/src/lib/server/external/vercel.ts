import { get } from '@vercel/edge-config';
import { PUBLIC_VERCEL_GIT_COMMIT_REF } from '$env/static/public';
import type { RequestEvent } from '@sveltejs/kit';

type MaintenanceConfig = {
  bypass: { ips: string[]; token: string };
  targets: Record<string, boolean>;
};

export const isUnderMaintenance = async (event: RequestEvent) => {
  if (event.isSubRequest || event.route.id === '/_internal/under-maintenance') {
    return false;
  }

  const config = await get<MaintenanceConfig>('maintenance');
  const {
    targets,
    bypass: { ips, token },
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  } = config!;

  if (
    !targets[PUBLIC_VERCEL_GIT_COMMIT_REF] ||
    ips.includes(event.getClientAddress()) ||
    event.request.headers.get('x-vercel-protection-bypass') === token
  ) {
    return false;
  }

  return true;
};
