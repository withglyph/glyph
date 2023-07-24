rm -rf .lambda
mkdir -p .lambda/sharp-layer/nodejs/node_modules

docker build . -t sharp
docker create --name sharp --platform linux/amd64 sharp
docker cp sharp:/build .lambda/sharp-layer/build
docker rm -f sharp

mv .lambda/sharp-layer/build/node_modules .lambda/sharp-layer/nodejs
rm -rf .lambda/sharp-layer/build
