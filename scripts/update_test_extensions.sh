#! /bin/bash

mkdir -p __test__/ext/chrome/lib
mkdir -p __test__/ext/firefox/lib

cp ./dist/tabs-manager.js* ./__test__/ext/chrome/lib/
cp ./dist/tabs-manager.js* ./__test__/ext/firefox/lib/
