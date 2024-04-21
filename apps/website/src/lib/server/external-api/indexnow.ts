import got from 'got';
import qs from 'query-string';

export const notify = async (url: string): Promise<void> => {
  await got(
    qs.stringifyUrl({
      url: 'https://searchadvisor.naver.com/indexnow',
      query: {
        url,
        code: '86a43bf812df4356b4456e82f8f67271',
      },
    }),
  );
};
