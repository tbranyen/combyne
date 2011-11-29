NODE_JS = $(if $(shell test -f /usr/bin/nodejs && echo "true"),nodejs,node)
BASE = .

all:
	uglifyjs combyne.js > dist/combyne.min.js

