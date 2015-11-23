#!/bin/sh

sudo apt-get install curl python-sqlalchemy -y
/vagrant/spacebnb.py >/vagrant/spacebnb.log 2>&1 &
