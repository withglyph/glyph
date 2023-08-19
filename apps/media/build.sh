IMAGE_NAME=721144421085.dkr.ecr.ap-northeast-2.amazonaws.com/penxle/media:latest

pnpm build
docker build -t $IMAGE_NAME .
docker push $IMAGE_NAME
