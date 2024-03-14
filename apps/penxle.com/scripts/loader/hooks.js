export const resolve = async (specifier, context, nextResolve) => {
  if (specifier.startsWith('$app/') || specifier.startsWith('$env/')) {
    return {
      url: `virtual://${specifier}`,
      shortCircuit: true,
    };
  }

  return nextResolve(specifier, context);
};

export const load = (url, context, nextLoad) => {
  if (url.startsWith('virtual://')) {
    const mod = url.replace(/^virtual:\/\//, '');
    let source;

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
