import type { UserSingleSignOnProvider } from '@prisma/client';

export type ExternalUser = {
  provider: UserSingleSignOnProvider;
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
};
