#!/bin/bash

(
  awk '
    BEGIN { doprint=1 }
    { if (doprint) print $0 }
    /^# BEGIN AUTO STATIC/ { doprint=0 }
  ' < app.yaml

  echo
  for i in $(find static -type f | grep -v '\.svn/' | sed s#^static/## | sort); do
    PREFIX=$(echo ${i} | sed 's/\.[^.]*$//')
    echo "- url: /${PREFIX}"
    echo "  static_files: static/${i}"
    echo "  upload: static/${i}"
    echo
   done

  awk '
    BEGIN { doprint=0 }
    /^# END AUTO STATIC/ { doprint=1 }
    { if (doprint) print $0 }
  ' < app.yaml
) > app.yaml.new

if ! diff app.yaml app.yaml.new >/dev/null; then
  mv app.yaml.new app.yaml
else
  rm app.yaml.new
fi
