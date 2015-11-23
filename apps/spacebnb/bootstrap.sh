#!/bin/sh

sudo apt-get install curl -y
/vagrant/spacebnb.py >/vagrant/spacebnb.log 2>&1 &
