const specialPrefixes = ['$app/', '$env/', '$assets/', '~icons/'];

export const resolve = async (specifier, context, nextResolve) => {
  if (specialPrefixes.some((prefix) => specifier.startsWith(prefix))) {
    return {
      url: `special://${specifier}`,
      shortCircuit: true,
    };
  }

  return nextResolve(specifier, context);
};

export const load = (url, context, nextLoad) => {
  if (url.startsWith('special://')) {
    const mod = url.replace(/^special:\/\//, '');
    let source;

    if (mod.startsWith('~icons/') || mod.startsWith('$assets/')) {
      return {
        format: 'module',
        source: 'export default {};',
        shortCircuit: true,
      };
    }

    switch (mod) {
      case '$env/dynamic/public':
      case '$env/dynamic/private':
        source = `export const env = process.env;`;
        break;
      case '$app/environment':
        source = `export const building = false; export const dev = true; export const browser = false;`;
        break;
      case '$app/stores':
        source = `export const page = {};`;
        break;
      default:
        throw new Error(`Unknown virtual module: ${mod}`);
    }

    return {
      format: 'module',
      source,
      shortCircuit: true,
    };
  }

  if (url.endsWith('.svelte')) {
    return {
      format: 'module',
      source: 'export default {};',
      shortCircuit: true,
    };
  }

  return nextLoad(url, context);
};
