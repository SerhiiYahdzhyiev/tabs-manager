# Test/Playground Extensions

This folder hold minimal extension for supported browsers of TabsManager library.
The may be used in development by core team and community contributors for
testing/debugging/prototyping functionalities of the library.

## Installation and Usage

### Installation

To install extension you can follow instrucions found by these links:

- For Chrome:
   - [Short](https://superuser.com/questions/247651/how-does-one-install-an-extension-for-chrome-browser-from-the-local-file-system)
   - [Longer](https://scoopbyte.net/how-to-create-your-own-google-chrome-extension/)
   - [Chrome Official](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)
- For Firefox:
   - [Official](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)

But I assume that if you are already here, you probably know what to do ;)

### Usage

Before using the test extensions you need to build the library and put the
distributable in the `lib` directory of each extension.
You can do the copying manually with your shell e.g. `cp ./dist/tabs-manager.js
__test__/ext/chrome/lib/tabs-manager.js`. There is also a short shell script in this
repository's root: `update_test_extensions.sh` that you can use. You may have to
`chmod` it accordingly in order to execute it.
For building the library use one of the scripts in `package.json`.

After setting everything up it is pretty straightforward: just open dev console
and access `manager` object, or create you own managers with:

```javascript
const my_manager = new TabsManager();
const my_manager_with_custom_name = new TabsManager({name: "Awesome manager!"});
```
