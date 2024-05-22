declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    flutter: {
      postMessage: (message: string) => void;
      addEventListener: (type: 'message', callback: (event: { data: string }) => void) => void;
      removeEventListener: (type: 'message', callback: (event: { data: string }) => void) => void;
    };
  }
}

export {};
