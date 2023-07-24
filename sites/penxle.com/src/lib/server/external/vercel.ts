import { get } from '@vercel/edge-config';
import { VERCEL_GIT_COMMIT_REF } from '$env/static/private';
import type { RequestEvent } from '@sveltejs/kit';

type MaintenanceConfig = {
  bypass: { ips: string[]; token: string };
  targets: Record<string, boolean>;
};

export const isUnderMaintenance = async (event: RequestEvent) => {
  if (
    event.isSubRequest ||
    event.route.id === '/_/internal/under-maintenance'
  ) {
    return false;
  }

  const config = await get<MaintenanceConfig>('maintenance');
  const {
    targets,
    bypass: { ips, token },
  } = config!;

  if (
    !targets[VERCEL_GIT_COMMIT_REF] ||
    ips.includes(event.getClientAddress()) ||
    event.request.headers.get('x-vercel-protection-bypass') === token
  ) {
    return false;
  }

  return true;
};
