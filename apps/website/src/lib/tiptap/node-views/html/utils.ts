export const makeIFrameContent = (content: string) => {
  return `
    <style>html, body { margin: 0 }</style>
    ${content}
    <script>
      (() => {
        const interval = setInterval(() => {
          if(document.body.scrollHeight > 0) {
            parent.postMessage({ type: 'resize', height: document.body.scrollHeight }, '*');
            clearInterval(interval);
          }
        }, 100);
      })();
    </script>
  `;
};
