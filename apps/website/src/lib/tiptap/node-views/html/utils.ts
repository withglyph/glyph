export const makeIFrameContent = (content: string) => {
  return `
    <style>html, body { margin: 0 }</style>
    ${content}
    <script>parent.postMessage({ type: 'resize', height: document.body.scrollHeight }, '*')</script>
  `;
};
