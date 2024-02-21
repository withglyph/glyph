// ref: https://stackoverflow.com/a/69328111
export function applyPreferredColorScheme(scheme: 'light' | 'dark') {
  for (const styleSheet of document.styleSheets) {
    for (const rule of styleSheet.cssRules) {
      if (rule instanceof CSSMediaRule && rule.media.mediaText.includes('prefers-color-scheme')) {
        switch (scheme) {
          case 'light':
            if (rule.media.mediaText.includes('dark')) {
              rule.media.deleteMedium('(prefers-color-scheme: dark)');
            }
            if (!rule.media.mediaText.includes('light')) {
              rule.media.appendMedium('(prefers-color-scheme: light)');
            }
            break;
          case 'dark':
            if (rule.media.mediaText.includes('light')) {
              rule.media.deleteMedium('(prefers-color-scheme: light)');
            }
            if (!rule.media.mediaText.includes('dark')) {
              rule.media.appendMedium('(prefers-color-scheme: dark)');
            }
        }
      }
    }
  }
}
