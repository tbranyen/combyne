NODE_JS = $(if $(shell test -f /usr/bin/nodejs && echo "true"),nodejs,node)
NODE_LIB_PATH = ~/.node_libraries

BASE = .
INSTALL_PATH = $(NODE_LIB_PATH)/combyne
SRC_PATH = $(BASE)/src

update: uninstall install

install:
	@@mkdir -p $(INSTALL_PATH)
	@@mkdir -p $(INSTALL_PATH)/lib

	@@cp -f $(BASE)/lib/* $(INSTALL_PATH)/lib/
	@@cp -f $(BASE)/package.json $(INSTALL_PATH)/

	@@echo "Installed to $(INSTALL_PATH)"

uninstall:
	@@rm -rf $(INSTALL_PATH)
	@@echo "Uninstalled from $(INSTALL_PATH)"

test:
	@@$(NODE_JS) $(BASE)/test/index.js test

min:
	@@uglifyjs $(SRC_PATH)/combyne.js > $(SRC_PATH)/combyne.min.js

.PHONY: test
