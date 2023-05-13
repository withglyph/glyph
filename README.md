# PRIM

## 요구사항

- Node 18 LTS 이상
- pnpm 8 이상
- MySQL CLI
- Doppler CLI

## 초대 필요한 외부 서비스

아래 계정의 초대가 필요합니다. 개발팀에 요청해주세요.

| 서비스 | 목적 | 프론트 개발시 필요 | 백엔드 개발시 필요 |
| :---: | :---: | :---: | :---: |
| [Vercel](https://vercel.com) | 서비스 및 프리뷰 배포 | :white_check_mark: | :white_check_mark: |
| [Doppler](https://doppler.com) | 환경변수 중앙 관리 | :white_check_mark: | :white_check_mark: |
| [PlanetScale](https://planetscale.com) | 데이터베이스 | | :white_check_mark: |

## 요구사항 설치

``` bash
$ brew install node mysql dopplerhq/cli/doppler
$ npm install -g pnpm
```

## 환경 초기화

```bash
$ git clone git@github.com:primitiveinc/prim.git
$ cd prim
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

### GraphQL 스키마 혹은 DB 스키마가 변경된 경우 

```bash
$ pnpm sync
```

### DB 스키마 변경이 필요할 경우

```bash
$ pnpm db:new
```
