#!/bin/sh

sudo apt-get install curl python-gevent python-sqlalchemy -y
/vagrant/spacebnb.py >/vagrant/spacebnb.log 2>&1 &
