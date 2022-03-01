"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const parser_js_1 = require("./parser/parser.js");
const path = require("path");
const fs = require("fs");
// const obj = parser('./parser/App.jsx');
// const obj = parser('./App.jsx');
function getTree() {
}
function activate(context) {
    // webviewView
    const provider = new NexusProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(NexusProvider.viewType, provider));
    // debugger terminal - success notification
    console.log('Congratulations, your extension "nexus" is now active!');
    // console.log(obj);
    // function readFile (){fs.readFileSync()}
    const resultObj = new parser_js_1.Parser(fs.readFileSync(path.resolve(__dirname, './parser/newApp.jsx')));
    let classObj = resultObj.programBody.filter(node => {
        return node.type === 'ClassDeclaration';
    });
    // console.log(classObj[0]);
    // console.log(classObj[0].body.body[1].value.body.body[0].argument.openingElement.name.name);//.body[1].value.body.body[0].argument.openingElement.name.name);**
    // filter all class declarations (like above)
    // for each class declaration node, look at body.body (Array)
    for (let i = 0; i < classObj.length; i++) {
        for (let j = 0; j < classObj[i].body.body.length; j++) {
            console.log(classObj[i].body.body[j]);
            if (classObj[i].body.body[j].key.name === 'render') {
                console.log('it works!', classObj[i].body.body[j].value.body.body[0].argument.openingElement.name.name);
            }
        }
    }
    // iterate through body.body, looking at all methodDefinitions
    // if .key.name === "render", use that class node
    // else continue 
    // console.log(
    // console.log(resultObj.main());
    // console.log(resultObj.testFs);
    // );
    // vscode window.alert
    let disposable = vscode.commands.registerCommand('nexus.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from Nexus!');
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// class object for webviewView content
class NexusProvider {
    // componentTree: any;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        // obj = undefined;
    }
    resolveWebviewView(webviewView) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        // obj = parser('./parser/App.jsx');
        // const temp = `<!DOCTYPE html>
        // <html lang="en">
        // <head>
        //   <meta charset="UTF-8">
        //   <!--
        //     Use a content security policy to only allow loading images from https or from our extension directory,
        //     and only allow scripts that have a specific nonce.
        //   -->
        //   <link href="" rel="stylesheet">
        // </head>
        // <body>
        // <div class="main-container">
        // </div>
        // <script src="${scriptUri}"></script>
        // </body>
        // </html>`;
        // webviewView.webview.html = temp;
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }
    _getHtmlForWebview(webview) {
        // const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const scriptUri = webview.asWebviewUri(
        // vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js')
        vscode.Uri.joinPath(this._extensionUri, 'dist', 'sidebar.js'));
        const styles = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'styles.css'));
        // console.log('pls work! ', obj);
        //     const bodyEnd = `</ul>
        //   </li>
        // </ul>`;
        //     let body = `
        // <ul class="root-tree">
        // <li><span class="tree" id="main-app-root">App</span>
        //   <ul class="subtree">
        // `;
        //     for (let i = 0; i < obj.length; i++) {
        //       if (obj[i]['children'].length > 0) {
        //         body += `<li><span class="tree">${obj[i]['name']}</span>`;
        //       } else {
        //         body += `<li class="top-level-tree">${obj[i]['name']}`;
        //       }
        //       if (obj[i]['children'].length > 0) {
        //         body += `<ul class="subtree" id='subtree'>`;
        //         for (let j = 0; j < obj[i]['children'].length; j++) {
        //           body += `<li class="third-level">${obj[i]['children'][j]['name']}</li>`;
        //         }
        //         body += `</ul></li>`;
        //       } else {
        //         body += `</li>`;
        //       }
        //     }
        //     body += bodyEnd;
        // props
        // iterate through the array of nodes that is returned from the parser
        // if the length of the value of the props property inside each object is greater than zero
        // list out the propsin a list
        // for (let i = 0; i < obj.length; i++) {
        //   if (obj[i]['props'].length > 0) {
        //   }
        // }
        // console.log(body);
        return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <!--
        Use a content security policy to only allow loading images from https or from our extension directory,
        and only allow scripts that have a specific nonce.
      -->
      <link href="" rel="stylesheet">
    </head>
    <body>
    <div class="main-container">
    </div>
    <script src="${scriptUri}"></script>
    </body>
    </html>`;
        // `<!DOCTYPE html>
        // 	<html lang="en">
        // 	<head>
        // 		<meta charset="UTF-8">
        // 		<!--
        // 			Use a content security policy to only allow loading images from https or from our extension directory,
        // 			and only allow scripts that have a specific nonce.
        // 		-->
        // 		<link href="${styles}" rel="stylesheet">
        // 	</head>
        // 	<body>
        //   <div class="main-container">
        //   ${body}
        //   <script src="${scriptUri}"></script>
        //   </div>
        // 	</body>
        // 	</html>`;
        // }
    }
}
NexusProvider.viewType = 'nexus.componentTreeView';
function deactivate() { }
exports.deactivate = deactivate;
/*
<ul class="root-tree">
  <li><span class="tree">pages</span>
    <ul class="subtree">
      <li>_app.js</li>
      <li><span class="tree">index.js</span>
          <ul class="subtree">
          <li>nav.js</li>
          <li>jumbotron.js</li>
          </ul>
      </li>
      <li><span class="tree">cats</span>
        <ul class="subtree">
        <li><span class="tree">index.js</span>
          <ul class="subtree">
          <li>nav.js</li>
          <li>card.js</li>
          </ul>
        </li>
        <li>[id].js</li>
        </ul>
      </li>
    </ul>
  </li>
</ul>
*/
//# sourceMappingURL=extension.js.map