# PENXLE

## 시스템 요구사항

- Node 18 LTS 이상
- pnpm 8 이상
- Doppler CLI

## 외부 서비스 요구사항

| 서비스 | 목적 |
| :---: | :---: |
| [Vercel](https://vercel.com) | 서비스 및 프리뷰 배포 |
| [Doppler](https://doppler.com) | 환경변수 중앙 관리 |

## 요구사항 설치

``` bash
$ brew install node dopplerhq/cli/doppler
$ npm install -g pnpm
```

## 환경 초기화

```bash
$ git clone git@github.com:penxle/penxle.git
$ cd penxle
$ pnpm bootstrap

$ doppler login
$ doppler setup  # 명령 실행 후 본인 env 선택
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

## 개발 

### DB 스키마 변경시

```bash
$ # 마이그레이션 생성 및 즉시 적용하기
$ pnpm db:migrate

$ # 마이그레이션 생성만 하기 (적용하려면 다시 `pnpm db:migrate` 실행)
$ pnpm db:migrate:create
```

## 라이센스 및 기여

- [LICENSE](https://github.com/penxle/penxle/blob/main/LICENSE)
- [Contributor License Agreement](https://github.com/penxle/penxle/blob/main/CLA)
