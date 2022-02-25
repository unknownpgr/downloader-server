set -e

TAG=$(git rev-parse --verify HEAD)
NAME=se.ction.link/upload-server
IMAGE=$NAME:$TAG
docker build -t $IMAGE .
docker push $IMAGE

cat kustomize/kustomization.template.yaml\
  | sed "s|NAME|$NAME|"\
  | sed "s|TAG|$TAG|"\
  > kubernetes/kustomization.yaml

kubectl apply -k kustomize