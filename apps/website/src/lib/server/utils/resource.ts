export const finalizeResource = async (identifier: string) => {
  const key = `__glyph_finalizers_${identifier}`;
  const finalizer = globalThis[key as never] as (() => Promise<void>) | undefined;

  if (finalizer) {
    await finalizer();
  }
};

export const setResourceFinalizer = (identifier: string, fn: () => Promise<void>) => {
  const key = `__glyph_finalizers_${identifier}`;
  globalThis[key as never] = fn as never;
};
