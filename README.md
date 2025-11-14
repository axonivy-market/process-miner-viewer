# Axon Ivy Process Miner Viewer

This repository contains the Axon Ivy (GLSP-based) process miner viewer.

## Prerequisites

The following libraries/frameworks need to be installed on your system:

- [Node.js](https://nodejs.org/en/) `>= 20.10.0`

The viewer is developed using [Visual Studio Code](https://code.visualstudio.com/).
However, it's of course also possible to use another text editor.

### Launch config prerequisites

Project [miner-test-project](./tests/miner-test-project/) is required to be running in a [Pro Designer](https://dev.axonivy.com/download) on port 8081.

---

## Commands

```bash
#install node modules
npm install

#run the viewer
npm run dev

#build the viewer
npm run package
```

## Running the process miner in VS Code

To start the viewer, you can start the **Launch Viewer** config directly inside VS Code. For this to work, the project **miner-test-project** is required to be running in a Pro Designer on port 8081.

## Running the process miner via commandline

To start the viewer via cli, you can run `npm run dev`.<br>
The viewer will now run at `http://localhost:3000`. To access it you can open the URL in a browser. Following url parameter are required to open the **miner-test-project** with the default mock-mining-data:

- server=localhost:8081
- app=designer
- pmv=miner-test-project
- file=/processes/Humantask/ProcurementRequestParallel.p.json

e.g. [`http://localhost:3000?server=localhost:8081&app=designer&pmv=miner-test-project&file=/processes/Humantask/ProcurementRequestParallel.p.json`](http://localhost:3000?server=localhost:8081&app=designer&pmv=miner-test-project&file=/processes/Humantask/ProcurementRequestParallel.p.json)

## Mining-Data

As default, mock-data from `http://localhost:3000/mock.json` is used.<br>
To provide a URL for the mining-data the url-parameter **miningUrl** can be used e.g. `http://localhost:3000/[url]&miningUrl=customUrl`

---

## Implementation in ivy project

1. build the viewer via `npm run package`
2. copy **dist/mock.json** and contents of **dist/assets** into **webcontent/resources** in ivy project
3. copy **dist/index.html** to **webcontent/view/process-miner.xhtml**
4. open **process-miner.xhtml** make following edits:
   - Add required libraries to html tag:
     ```xhtml
     <html xmlns="http://www.w3.org/1999/xhtml" xmlns:f="http://xmlns.jcp.org/jsf/core" xmlns:h="http://xmlns.jcp.org/jsf/html"></html>
     ```
   - replace `<head>` with `<h:head>`
   - replace js and css with `<h:outputScript>` and `<h:outputStylesheet>`:
     ```xhtml
     <h:outputScript name="resources/index-CmkAVbW5.js" />
     <h:outputStylesheet name="resources/index-C332O8_T.css" library="ivy-webcontent" />
     ```

The process-miner-viewer can now be used in any dialog using an iframe:

- For the url-parameters to work, all **&** have to be replaced with **\&amp;**
- To use the mock-data provided in **mock.json** the miningUrl parameter has to be set to: `#{resource['resources/mock.json']}`

```xhtml
<iframe
  src="/designer/faces/view/DemoProject/process-miner.xhtml?server=localhost:8081&amp;app=designer&amp;pmv=miner-test-project&amp;file=/processes/Humantask/ProcurementRequestParallel.p.json&amp;miningUrl=#{resource['resources/mock.json']}"
  width="1000"
  height="900"
></iframe>
```

---

## Mining visualization

[`app.ts`](src/app.ts)<br>
Here the processUrl is read via query-parameter "processUrl".
If no such parameter is provided, a fallback ("http://localhost:3000/mock.json") is used.

### Visualization

All code to modify the mining visualization is located in [`src/case-visualisation`](src/case-visualisation).

[`di-config.ts`](src/case-visualisation/di.config.ts)<br>
Used to register case-visualisation-action-handler, command and view to change the element properties (color).

[`action.ts`](src/case-visualisation/action.ts)<br>
ActionHandler for the aseVisualizationAction

[`case-visualization-action.ts`](src/process-mining-visualisation/mining-action.ts)<br>
CaseProcessViewerCommand used to display case process data. CaseProcessViewerCommand (execute) is called when CaseProcessViewerAction is fired. Adds a parameter `passed` to each element in process data used to change color.

[`public/mock.json`](public/mock.json)<br>
mock-case-visualisation-data used when no processUrl url-parameter is specified

The case-visualisation is fired in [`src/startup.ts`](src/startup.ts) after the model is initialized.

---

## More information

For more information about GLSP, please visit the [Eclipse GLSP Umbrella repository](https://github.com/eclipse-glsp/glsp) and the [Eclipse GLSP Website](https://www.eclipse.org/glsp/).
