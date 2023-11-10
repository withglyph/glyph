import { writable } from 'svelte/store';
import type { PostKind } from '@prisma/client';

export const pageTitle = writable<string | null>(null);
export const pageSubTitle = writable<string | null>(null);

export const postKind = writable<PostKind>('ARTICLE');
