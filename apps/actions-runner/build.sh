pnpm exec turbo run build
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 721144421085.dkr.ecr.ap-northeast-2.amazonaws.com
docker build --tag 721144421085.dkr.ecr.ap-northeast-2.amazonaws.com/actions-runner:latest .
docker push 721144421085.dkr.ecr.ap-northeast-2.amazonaws.com/actions-runner:latest
