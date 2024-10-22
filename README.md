# TabsManager Library

**TabsManager** is a JavaScript library designed to simplify browser tab
management for browser extension developers. It offers a developer-friendly API
to interact with browser tabs, track their lifecycle, and manage them
efficiently.

---

This project was created as a part of the assignment from my university. I've
implemented something similar in some other extension projects but those
"tab managers" where more tailored to the projects' specificities and goals. In
the current state the lib doesn't do much custom, and can be considered pretty
much useless, but I'm planning on improving it, and I will be very happy to
recieve suggestions and feature requrests from the community, and don't be shy
to critic my terrible code (but try to stay constructive...) =)

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Initialization](#initialization)
  - [Public Methods](#public-methods)
- [Example](#example)
- [License](#license)

## Installation

Download minified file from this repo and add it to your browser extension
development project.

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

Then, instantiate the `TabsManager` object:

```javascript
const manager = new TabsManager({});
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

##### TabsManager objects also have following methods from <browser|chrome>.tabs object:
    - create
    - connect
    - discard
    - query
    - remove
    - reload
    - update

In future they will have some useful wrappers that will decorate them with
handy capabilities...

### The `Tab` Class

Each tab in **TabsManager** is wrapped in a `Tab` class that provides
additional functionality:

- `createdAt`: The timestamp when the tab was created.
- `uptime`: Time elapsed since the tab was created.
- `msFromLastAccessed`: Time in milliseconds since the tab was last accessed.

## Example

Here’s a simple example of how to integrate **TabsManager** into your
extension:

```javascript
const manager = new TabsManager();

// Create a new tab
manager.create({ url: 'https://example.com' });

// Check if a tab with a specific URL exists
if (manager.has('https://example.com')) {
    const tab = manager.get('https://example.com');
    console.log(`Tab found with ID: ${tab.id}`);
}

// Remove a tab by its ID
manager.remove(123);
```

## License

This library is licensed under the MIT License. See the LICENSE file for more details.
