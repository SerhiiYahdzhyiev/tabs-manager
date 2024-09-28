# TabsManager Library

**TabsManager** is a lightweight JavaScript library designed to simplify browser tab management for browser extension developers. It offers a developer-friendly API to interact with browser tabs, track their lifecycle, and manage them efficiently.

---

This project was create as a part of the assignment from my university. I've implemented something similar in some other extension projects but those "tab managers" where more tailored to the projects' specificities and goals. In the current state the lib doesn't do much custom, and can be considered pretty much useless, but I'm planning on improving it, and I will be very happy to recieve suggestions and feature requrests from the community, and don't be shy to critic my terrible code (but try to stay constructive...) =)

## Current "Features"

- Simplified tab creation, updating, and removal.
- Convenient methods to track tabs by their URL or ID.
- Tab uptime and last accessed time tracking.
- Automatic event listeners for tab creation, updates, and removal.
- Utility to detect the browser environment (window or worker).
- MIT Licensed — free for both personal and commercial use.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Initialization](#initialization)
  - [Public Methods](#public-methods)
- [Example](#example)
- [License](#license)
- [Contribution](#contribution)

## Installation

Currently I've not worked on convenient way to install it. The only way is to clone this repo, run `build` script from package json. and take the contents of transpiled `dist/index.js` and work with it as you like.

For example, place the contents in the `tabsManager.js`, and then add it to your extension:

```bash
/my-extension
│
├── /src
│   └── tabsManager.js
└── manifest.json
```

## Usage

### Initialization

To initialize the `TabsManager`, the library must be included in your extension script. Ensure your extension has the required permissions (`tabs` and `activeTab`) in the `manifest.json`.

```json
{
  "permissions": [
    "tabs",
    "activeTab"
  ]
}
```

Then, instantiate the `TabsManager`:

```javascript
const manager = new TabsManager({});
```

*Note*: Construction options/payload currently can be omitted as it is not in use yet...

### Public Methods

The **TabsManager** provides several methods for managing and retrieving tab information.

#### `TabsManager.withTabs(cb)`

A static utility to access all currently tracked tabs. Takes a callback function that operates on the tabs.

**Parameters:**

- `cb`: A function that receives the `Tabs` instance and performs operations on it.

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
    - remove
    - reload
    - update

In future they will have some useful wrappers that will decorate them with handy capabilities...

### The `Tab` Class

Each tab in **TabsManager** is wrapped in a `Tab` class that provides additional functionality:

- `createdAt`: The timestamp when the tab was created.
- `uptime`: Time elapsed since the tab was created.
- `msFromLastAccessed`: Time in milliseconds since the tab was last accessed.

## Example

Here’s a simple example of how to integrate **TabsManager** into your extension:

```javascript
const manager = new TabsManager({});

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

## Contribution

We welcome contributions to improve **TabsManager**! Whether it's a new feature suggestion, performance optimization, bug fix, or documentation improvement, your help is highly appreciated. Here’s how you can get involved:

### Feature Requests and Suggestions

If you have ideas for new features or improvements, feel free to open an issue in the repository. I am particularly interested in:

- Improving performance.
- Adding more robust tab lifecycle management features.
- Supporting more advanced browser-specific functionality.
- Decomposing code into modules
- Providing better build/bundling flow
- Enforcing best practices and clean code
- Improving cross-browserness

### How to Contribute

1. **Fork the repository**: Start by forking the project to your GitHub account.

2. **Clone the repository**: Clone the forked repository to your local machine.
    ```bash
    git clone https://github.com/YOUR-USERNAME/tabs-manager.git
    cd tabs-manager
    ```

3. **Create a new branch**: Before making any changes, create a new branch for your contribution.
    ```bash
    git checkout -b feature/your-feature-name
    ```

4. **Make your changes**: Write the code for the feature or bug fix you are working on. Ensure your code follows good practices and is well-tested.

5. **Commit your changes**: After making your changes, commit them to your branch.
    ```bash
    git add .
    git commit -m "Description of your changes"
    ```

6. **Push your changes**: Push your changes to your forked repository on GitHub.
    ```bash
    git push origin feature/your-feature-name
    ```

7. **Create a Pull Request**: Go to the original repository and create a Pull Request (PR) from your forked branch. In your PR, please explain the changes and why they should be merged.

---

### Contribution Guidelines

- Follow the existing code style and structure as much as possible.
- Include comments where necessary to explain complex logic.
- Test your changes to ensure nothing breaks.
- Keep your PR small and focused on a single issue or feature.
- If you're working on a larger feature, consider discussing it in an issue before starting work.

Thank you for considering contributing to **TabsManager**! We're excited to see how the community can help this project grow and evolve.
