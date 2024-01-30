export const values = {
  color: [
    { label: '검정색', value: '#1c1917' },
    { label: '회색', value: '#78716c' },
    { label: '연회색', value: '#a8a29e' },
    { label: '빨간색', value: '#ea4335' },
    { label: '파란색', value: '#4285f4' },
    { label: '갈색', value: '#a96d42' },
    { label: '초록색', value: '#00c75e' },
    { label: '보라색', value: '#9747ff' },
    { label: '흰색', value: '#ffffff' },
  ],

  fontFamily: [
    { label: '프리텐다드', value: 'Pretendard' },
    { label: '리디바탕', value: 'RIDIBatang' },
    { label: 'KoPubWorld 바탕', value: 'KoPubWorldBatang' },
    { label: '나눔명조', value: 'NanumMyeongjo' },
  ],

  fontSize: [
    { label: '8pt', value: 8 },
    { label: '10pt', value: 10 },
    { label: '12pt', value: 12 },
    { label: '14pt', value: 14 },
    { label: '16pt', value: 16 },
    { label: '18pt', value: 18 },
    { label: '20pt', value: 20 },
    { label: '22pt', value: 22 },
    { label: '24pt', value: 24 },
    { label: '36pt', value: 36 },
    { label: '48pt', value: 48 },
    { label: '60pt', value: 60 },
    { label: '72pt', value: 72 },
  ],

  lineHeight: [
    { label: '80%', value: 0.8 },
    { label: '100%', value: 1 },
    { label: '120%', value: 1.2 },
    { label: '140%', value: 1.4 },
    { label: '160%', value: 1.6 },
    { label: '180%', value: 1.8 },
    { label: '200%', value: 2 },
    { label: '220%', value: 2.2 },
  ],

  letterSpacing: [
    { label: '-10%', value: -0.1 },
    { label: '-5%', value: -0.05 },
    { label: '0%', value: 0 },
    { label: '5%', value: 0.05 },
    { label: '10%', value: 0.1 },
    { label: '20%', value: 0.2 },
    { label: '40%', value: 0.4 },
  ],

  textAlign: [
    { label: '왼쪽', value: 'left', icon: 'i-lc-align-left' },
    { label: '중앙', value: 'center', icon: 'i-lc-align-center' },
    { label: '오른쪽', value: 'right', icon: 'i-lc-align-right' },
    { label: '양쪽', value: 'justify', icon: 'i-lc-align-justify' },
  ],

  horizontalRule: [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }, { value: 6 }, { value: 7 }],

  blockquote: [{ value: 1 }, { value: 2 }, { value: 3 }],
} as const;
