#!/bin/bash

#This is a script to push the resulting js to http://eurica.github.io/pdjs/pdjs.js

releasedir=../pdjsgh
echo Last version number:
cat version
[ "$#" -eq 1 ] || { echo " Please enter a version number" >&2; exit 1; }
version=$1
echo Creating version ${version}
echo ${version} > version

# This is the ugliest sed ever, someday I'll fix it.
sed -i '' -E 's/version *= *"PDJS-[0-9.]+"/version = "PDJS-VERSIONNUMBER"/g' coffee/pdjsbase.coffee
sed -E -i '' s/VERSIONNUMBER/${version}/g coffee/pdjsbase.coffee

cp coffee/* ${releasedir}/coffee/

# prepare a release
coffee --output ${releasedir}/ --compile --join pdjs.js coffee/
cp README.* ${releasedir}/
cp -r examples/* ${releasedir}/examples/

cwd=$(pwd)
cd ${releasedir}/
cp pdjs.js js/pdjs-${version}.js
cp pdjs.js js/pdjs.js
git add .
git commit -m "preparing version ${version} for github pages"
git push origin gh-pages --force
cd ${cwd}
