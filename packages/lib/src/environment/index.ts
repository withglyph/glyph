import { PUBLIC_PULUMI_STACK } from '$env/static/public';

export const stack = PUBLIC_PULUMI_STACK;
export const production = stack === 'prod';
