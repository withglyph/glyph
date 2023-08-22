echo "Building actions-runner image..." \
  && aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 721144421085.dkr.ecr.ap-northeast-2.amazonaws.com \
  && pnpm run build \
  && docker build . -t 721144421085.dkr.ecr.ap-northeast-2.amazonaws.com/actions-runner:latest \
  && docker push 721144421085.dkr.ecr.ap-northeast-2.amazonaws.com/actions-runner:latest
