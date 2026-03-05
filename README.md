# bpmn-js-diffing

[![Build Status](https://github.com/bpmn-io/bpmn-js-diffing/workflows/CI/badge.svg)](https://github.com/bpmn-io/bpmn-js-diffing/actions?query=workflow%3ACI)

Visual diffing of BPMN 2.0 diagrams.

![Visual Diffing Demo](docs/screenshot.png)

## Features

* Identify added, removed, changed and layout-changed elements
* Visual highlighting in [bpmn-js](https://github.com/bpmn-io/bpmn-js)
* Works in Node.js for pure data diffing


## Usage

### Node.js

You can use the library to perform diffs in Node.js. This is useful for automated processing of BPMN files.

```javascript
'use strict';

const fs = require('fs');
const BpmnModdle = require('bpmn-moddle');
const Differ = require('bpmn-js-diffing');

async function run() {
  const moddle = new BpmnModdle();
  
  const aDiagram = fs.readFileSync('diagramA.bpmn', 'utf-8');
  const bDiagram = fs.readFileSync('diagramB.bpmn', 'utf-8');

  const { rootElement: adefs } = await moddle.fromXML(aDiagram);
  const { rootElement: bdefs } = await moddle.fromXML(bDiagram);

  const results = Differ.diff(adefs, bdefs);

  console.log('Added:', results._added);
  console.log('Removed:', results._removed);
  console.log('Changed:', results._changed);
  console.log('Layout Changed:', results._layoutChanged);
}

run().catch(err => console.error(err));
```

### Browser

In the browser, you can use the library together with [bpmn-js](https://github.com/bpmn-io/bpmn-js) to visualize changes.

```javascript
const Differ = require('bpmn-js-diffing');

// ... load viewers ...

const results = Differ.diff(viewerOld.definitions, viewerNew.definitions);

// results contains mapping: elementId -> element
```

Check out the [demo application](app/) for a full implementation.


## Development

### Setup

```bash
npm install
```

### Run Tests

```bash
npm test
```

### Run Demo App

To run the demo application locally:

```bash
npx serve
```

Then open `http://localhost:3000/app/index.html` in your browser.
This ensures that the `resources/` and `assets/` directories, located outside the `app/` folder, are correctly loaded.


## License

MIT
