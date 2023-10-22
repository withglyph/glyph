import * as ChannelService from '@channel.io/channel-web-sdk-loader';

export const setupChannelIO = () => {
  ChannelService.loadScript();
};

export { default as ChannelIOButton } from './Button.svelte';
