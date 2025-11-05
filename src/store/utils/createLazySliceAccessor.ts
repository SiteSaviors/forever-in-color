export const createLazySliceAccessor = <T>(importer: () => Promise<T>) => {
  let cachedModule: T | null = null;
  let inflightPromise: Promise<T> | null = null;

  const load = async (): Promise<T> => {
    if (cachedModule) {
      return cachedModule;
    }
    if (!inflightPromise) {
      inflightPromise = importer()
        .then((module) => {
          cachedModule = module;
          return module;
        })
        .finally(() => {
          inflightPromise = null;
        });
    }
    return inflightPromise;
  };

  const peek = () => cachedModule;

  return {
    load,
    peek,
  };
};
