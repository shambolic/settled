#!/bin/bash
# installation script for settled.co.uk on Mac
echo "This script will install Docker for Mac and start the Settled prototype...."
read -p "Press [Enter] key to continue....."
echo "Do you need to install Docker for Mac? [y/N]"
read -n 1 response

if [ $response = "y" ]; then
  echo "Downloading Docker for Mac...."
  wget -c https://download.docker.com/mac/beta/Docker.dmg 
  open "Docker.dmg"
  echo "installing docker (sudo password required)....."
  sudo cp -R  /Volumes/Docker/Docker.app/ /Applications/Docker.app  
fi

echo "starting Docker for Mac...."
open /Applications/Docker.app 
sleep 10 # give Docker time to start. 
echo "building containers...."
docker-compose build
echo "bringing up servers...."
docker-compose up &
sleep 5
cd public
python -m SimpleHTTPServer &   # would normally use http-server -o but everyone has python, so shold be quicker in case it's not installed
open http://localhost:8000



