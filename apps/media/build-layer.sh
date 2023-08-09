rm -rf .sst/layers
mkdir -p .sst/layers/sharp

docker build . -t sharp
docker create --name sharp --platform linux/amd64 sharp
docker cp sharp:/build .sst/layers/sharp/nodejs
docker rm -f sharp
