echo "Building actions-runner image..." \
  && pnpm run build \
  && aws s3 cp s3://penxle-artifacts/actions-runner/tool-cache.tar.gz dist/ \
  && aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 721144421085.dkr.ecr.ap-northeast-2.amazonaws.com \
  && docker build . -t 721144421085.dkr.ecr.ap-northeast-2.amazonaws.com/actions-runner:latest \
  && docker push 721144421085.dkr.ecr.ap-northeast-2.amazonaws.com/actions-runner:latest
