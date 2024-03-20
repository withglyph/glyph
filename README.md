# Glyph

![](https://img.shields.io/github/actions/workflow/status/withglyph/glyph/ci.yml)
![](https://img.shields.io/github/license/withglyph/glyph)
![](https://img.shields.io/github/languages/code-size/withglyph/glyph)

나만의 공간, 함께 새겨질 우주 - Glyph

## 시스템 요구사항

- Node 20 LTS 이상
- pnpm 8 이상
- Doppler CLI

## 외부 서비스 요구사항

|             서비스             |        목적        |
| :----------------------------: | :----------------: |
| [Doppler](https://doppler.com) | 환경변수 중앙 관리 |

## 요구사항 설치

```bash
$ npm install -g pnpm
$ brew install node dopplerhq/cli/doppler
$ doppler login
```

## 환경 초기화

```bash
$ git clone git@github.com:withglyph/glyph.git
$ cd glyph
$ pnpm bootstrap
```

## 실행

### 터미널에서 실행시

```bash
$ pnpm dev
```

### vscode에서 실행시

```
`Launch` 액션 사용시 자동으로 실행됨
```

## 라이센스 및 기여

- [LICENSE](LICENSE)
- [Contributor License Agreement](docs/CLA)
