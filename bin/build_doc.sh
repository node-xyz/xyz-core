./node_modules/typedoc/bin/typedoc . --out ./../node-xyz.github.io/apidoc --module commonjs 

rpl '_' 'M' ./../node-xyz.github.io/apidoc/index.html
rpl '_' 'M' ./../node-xyz.github.io/apidoc/globals.html

rename  'y/_/M/' ./../node-xyz.github.io/apidoc/modules/*
rename  'y/_/M/' ./../node-xyz.github.io/apidoc/classes/*
rename  'y/_/M/' ./../node-xyz.github.io/apidoc/interfaces/*
