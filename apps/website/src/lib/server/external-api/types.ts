import type { UserSingleSignOnProvider } from '$lib/enums';

export type ExternalUser = {
  provider: keyof typeof UserSingleSignOnProvider;
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
};
