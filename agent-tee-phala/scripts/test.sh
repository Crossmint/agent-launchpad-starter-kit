#!/bin/bash

export DSTACK_ENDPOINT=http://localhost:8090

echo "Starting TEE simulator..."
docker run -d -p 8090:8090 --name tee-simulator phalanetwork/tappd-simulator:latest

echo "Waiting for simulator to be ready..."
sleep 5

echo "Running tests..."
ts-node src/_tests/generateKeys.ts

echo "Cleaning up..."
docker stop tee-simulator
docker rm tee-simulator