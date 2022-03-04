import { Parser } from './parser/parser.js';
import * as vscode from 'vscode';
const path = require("path");
const fs = require("fs");

// class object for webviewView content
export class NexusProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  public static readonly viewType = 'nexus.componentTreeView';
  // componentTree: any;
  constructor(private readonly _extensionUri: vscode.Uri) {
    // obj = undefined;
  }

  // function
    // run parser
      // grab data
        // send message to webviewAPI with data using webview.postMessage(data)
  
  public parseCodeBaseAndSendMessage(filePath: string) {

    const resultObj = new Parser(fs.readFileSync(path.resolve(__dirname, filePath)));
    // const resultObj = new Parser(fs.readFileSync(path.resolve(__dirname, './parser/newApp.jsx')));
    const data = resultObj.main();
    console.log(data);

    console.log('in parse and send message');
    this._view.webview.postMessage(data);
  }

  
  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.onDidReceiveMessage(async (data) => {
      // OG File Path = './parser/newApp.jsx'
      switch (data.type) {
        case "addFile": {
          console.log(data.value);
          this.parseCodeBaseAndSendMessage(data.value);
        }
      }
    });
    
    
    // obj = parser('./parser/App.jsx');
    // this.parseCodeBaseAndSendMessage(this._view);
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }

  _getHtmlForWebview(webview: vscode.Webview) {
    console.log('running gethtmlforwebview');
    // const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'sidebar.js')
      );
      const styles = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'media', 'styles.css')
        );
        
        // console.log(scriptUri);
        // console.log(styles);
        
        
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<link href="${styles}" rel="stylesheet">
        </head>
        <body>
        <div id = "root"></div>
        <script src="${scriptUri}"></script>
        </body>
        </html>`;
    }
}

export function deactivate() {}