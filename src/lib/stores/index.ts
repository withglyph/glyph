import { writable } from '@svelte-kits/store';

type Session = {
  userId: string;
  profileId: string;
};

export const session = writable<Session | null>(null);
