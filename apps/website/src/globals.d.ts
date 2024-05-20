declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    flutter_inappwebview: {
      callHandler: (name: string, ...args: unknown[]) => Promise<unknown>;
    };
  }
}

export {};
