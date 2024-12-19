# TabsManager Library

**TabsManager** is a JavaScript library designed to simplify browser tab
management for browser extension developers. It offers a developer-friendly API
to interact with browser tabs, track their lifecycle, and manage them
efficiently.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Initialization](#initialization)
  - [Public Methods](#public-methods)
- [Sandbox Extensions](#sandbox-extensions)
- [License](#license)

## Installation

Download minified file from this repo's releases and add it to your browser
extension development project.

For example:

```bash
/my-extension
│
├── /lib
│   └── tabs-manager.min.js
└── manifest.json
```

*With Service Worker:*

`manifest.json`;
```json
{
    "background": {
        "service_worker": "background.js"
    },
}
```

`background.js`:
```javascript
importScripts("./lib/tabs-manager.min.js");

// ...
```

*As Background Page Script:*

`manifest.json`;
```json
{
    "background": {
        "scripts": [
            "./lib/tabs-manager.min.js",
            "./background.js"
        ]
    },
}
```

## Usage

### Initialization

To initialize the `TabsManager`, the library must be included in your extension
script. Ensure your extension has the required permissions (`tabs` and
`activeTab`) in the `manifest.json`.

```json
{
  "permissions": [
    "tabs",
    "activeTab"
  ]
}
```

*NOTE: Library also has some optional permissions extra functionalities:*

- "scripting"
- "debugger"

*Some methods will not work without them and will yield a warning to the console.*
*Full pack of permissions will look like this:*

```json
{
  "permissions": [
    "tabs",
    "activeTab",
    "scripting",
    "debugger",
  ]
}
```

**WARNING:** *Currently threre are some unfixed issues regarding `debugger` permission
and methods related to it in Firefox browser!*

Then, instantiate the `TabsManager` object in your extensino's code:

```javascript
const manager = new TabsManager(); // Withour options...
const my_manager = new TabsManager({name: "My Manager"}); // Withour custom name
```

*Note:* You can create as many instances of `TabsManager` as you want, but with
current capabilities of this object this probably does not make much sense, but
I'm working on it. In the future you will be able to use managers, like this:

```javascript
const gitHubTabs = new TabsManager({
    filters: [
            {
                type: "host",
                value: "github.com"
            },
            // ...
        ]
    });
```

The previous example is a draft, if you have any ideas on how to improve the
interface or extend functionalities, please consider contributing.

*Note: Construction options/payload currently can be omitted as it is not in
use yet...*

### Public Methods

The **TabsManager** provides several methods for managing and retrieving tab
information.

#### `TabsManager.withTabs(cb)`

A static utility to access all currently tracked tabs. Takes a callback
function that operates on the tabs.

**Parameters:**

- `cb`: A function that receives the `Tabs` instance and performs operations
        on it.

```javascript
const doSomething = TabsManager.withTabs((tabs, myArg) => {
    console.log(tabs);
    console.log(myArg);
    //...Do something...
});

doSomething(42); // [Tab, Tab ...], 42
```

#### `manager.getAll()`

Retrieve all currently open tabs tracked by the manager.

**Returns:**

- An array of `Tab` objects.

```javascript
const allTabs = manager.getAll();
```

#### `manager.get(key)`

Retrieve a specific tab by its ID or tabs list by URL.

**Parameters:**

- `key`: The ID or URL of the tab(s).

**Returns:**

- A `Tab` object if found (or list of `Tab` objects), otherwise `null`.

```javascript
const tab = manager.get(123); // by ID
const tabsByUrl = manager.get('https://example.com'); // by URL
```

#### `manager.has(key)`

Check if a tab exists by its ID or URL.

**Parameters:**

- `key`: The ID or URL of the tab.

**Returns:**

- `true` if the tab exists, `false` otherwise.

```javascript
const exists = manager.has(123);
```

`TabsManager` instances also provide some handy getters/properties for accessing tabs:

#### `tabs`

Currently returns an array of `Tab` instances.

Example:

```javascript
const manager = new TabsManager();

manager.tabs[0]; // Access first tab
```

#### `first`

Returns first `Tab`.

Example:

```javascript
const manager = new TabsManager();

manager.first; // Access first tab
```

#### `last`

Returns last `Tab`.

Example:

```javascript
const manager = new TabsManager();

manager.first; // Access last tab
```

##### TabsManager objects also have following methods from <browser|chrome>.tabs object:
    - create
    - connect
    - discard
    - query
    - remove
    - reload
    - update

Their signatures in most cases are the same as in `chrome.tabs`.

### The `Tab` Class

Each tab in **TabsManager** is wrapped in a `Tab` class that provides
additional properties/getters:

- `createdAt`: The timestamp when the tab was created.
- `uptime`: Time elapsed since the tab was created.
- `msFromLastAccessed`: Time in milliseconds since the tab was last accessed.
- `urlObj`: Tabs url as `URL` instance.
    - `host`
    - `hostname`
    - `origin`
    - `href`
    - `protocol`
    - `username`
    - `hash`
    - `password`
    - `pathname`
    - `search`
    - `searchParams` (URLSearchParams | null)
    - `port`

From first minor version you can also call some manipulation methods on the `Tab`
class instance directly like this:

```javascript
const first = manager.first;

await first.remove(); // Close first tab...
```

Here is the list of available manipulation methods:

- **connect(options: chrome.tas.ConnectInfo)**
- **async clearAllInputs()**
- **async discard()**
- **async duplicate()**
- **async duplicate()**
- **async goForward()**
- **async goBack()**
- **async getLanguage()**
- **async getScreenshot(options: chrome.tabs.CaptureVisibleTabOptions)**
- **async move(options: chrome.tabs.MoveProperties)**
- **async reload()**
- **async remove()**
- **async update(options: chrome.tabs.UpdateProperties)**
- **async focus()**
- **async forceClose()** *Requires optional permissions!*

## Sandbox Extensions

This repository holds some sandbox/playground extensions to test/develop
the library. Check the nexted `README.md` file inside `__test__/ext`.

## License

This library is licensed under the MIT License. See the LICENSE file for more details.
