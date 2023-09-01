# PENXLE

![](https://img.shields.io/github/actions/workflow/status/penxle/penxle/ci.yml)
![](https://img.shields.io/github/license/penxle/penxle)
![](https://img.shields.io/github/languages/code-size/penxle/penxle)

함께 그리는 반짝임, PENXLE.

## 시스템 요구사항

- Node 18 LTS 이상
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
$ git clone git@github.com:penxle/penxle.git
$ cd penxle
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
