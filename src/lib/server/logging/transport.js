import build from 'pino-abstract-transport';

// eslint-disable-next-line import/no-default-export
export default async function () {
  return build(async (source) => {
    for await (let obj of source) {
      console.log(obj);
    }
  });
}
