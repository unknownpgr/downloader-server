set -e
TAG=$(git rev-parse --verify HEAD)
IMAGE=se.ction.link/upload-server:$TAG
docker build -t $IMAGE .
docker push $IMAGE