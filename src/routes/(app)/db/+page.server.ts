export const load = async (event) => {
  return {
    db: await event.locals.trpc.test.db.query(),
  };
};
