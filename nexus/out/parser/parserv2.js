"use strict";
// const PARSER = require('acorn').Parser;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const parserModule = require("acorn");
const PARSER = parserModule.Parser;
// const jsx = require('acorn-jsx');
const jsx = require("acorn-jsx");
const JSXPARSER = PARSER.extend(jsx());
const fs = require("fs");
const path = require("path");
// const fs = require("fs");
// const path = require("path");
// CONSTANTS 
const JSXTEXT = 'JSXText';
const JSXELEMENT = 'JSXElement';
const JSXEXPRESSIONCONTAINER = 'JSXExpressionContainer';
class ComponentNode {
    constructor(name, props, children, dataFetching) {
        this.name = name;
        this.children = children;
        this.props = props;
        this.dataFetching = dataFetching;
    }
}
class Parser {
    constructor(sourceCode, str) {
        this.string = str;
        // console.log('Source Code: ', sourceCode);
        // console.log('dirname: ', __dirname);
        this.program = JSXPARSER.parse(sourceCode, { sourceType: "module" }); // Node Object -> take body property (Array)
        // console.log('program: ', this.program);
        this.programBody = this.program.body;
        // console.log('program body: ', this.programBody);
    }
    //methods
    getImportNodes(programBody) {
        const importNodes = programBody.filter((node) => node.type === 'ImportDeclaration');
        // console.log(importNodes);
        return importNodes;
    }
    getVariableNodes(programBody) {
        const variableNodes = programBody.filter((node) => node.type === 'VariableDeclaration');
        return variableNodes;
    }
    getExportDefaultNodes(programBody) {
        const exportDefaultNodes = programBody.filter((node) => node.type === 'ExportDefaultDeclaration');
        return exportDefaultNodes;
    }
    getNonImportNodes(programBody) {
        const nonImportNodes = programBody.filter((node) => node.type !== 'ImportDeclaration');
        return nonImportNodes;
    }
    getExportNamedNodes(programBody) {
        const exportNamedNodes = programBody.filter((node) => node.type === 'ExportNamedDeclaration');
        return exportNamedNodes;
    }
    getJsxNodes(childrenNodes) {
        const jsxNodes = childrenNodes.filter((node) => node.type === JSXELEMENT);
        return jsxNodes;
    }
    getChildrenNodes(variableNodes) {
        console.log('testing... ', variableNodes);
        // RETURN STATEMENT in functional component
        // TODO: refactor to look at all nodes, not just last varDeclaration node
        const nodes = variableNodes[variableNodes.length - 1].declaration.body.body;
        //    console.log('nodes: ', nodes);
        const returnNode = nodes.filter((node) => node.type === 'ReturnStatement')[0];
        const childrenNodes = returnNode.argument.children;
        //    console.log(childrenNodes);
        return childrenNodes;
    }
    mapComponentToFilepath(jsxNodes, importNodes) {
        const map = {};
        const importValues = importNodes.map((node) => node.source.value);
        // const componentPaths = importValues.filter((str) => str.slice(0, 14) === regex); 
        // console.log('tesing Regex: ', importValues);
        // const map = {};
        for (let str of importValues) {
            const splitName = str.split('/');
            const componentPath = splitName[splitName.length - 1];
            const name = componentPath.split('.')[0];
            map[name] = str;
        }
        console.log('Map: ', map);
        return map;
    }
    getTree(filePath) {
        console.log('filePath: ', filePath);
        console.log('path.resolve:', path.resolve(__dirname, filePath));
        console.log('original string passed in', this.string);
        const source = fs.readFileSync(path.resolve(filePath));
        const parsed = JSXPARSER.parse(source, { sourceType: "module" });
        const programBody = parsed.body; // get body of Program Node(i.e. source code entry)
        return programBody;
    }
    // input: array of nodes
    // output: endpoint (string)
    getRouterEndpoint(tree) {
        console.log('entering getRouterEndpoint with: ', tree);
        // TODO: hardcoded for router variable, change to find label for useRouter() instead to match against
        const exportObject = this.getExportDefaultNodes(tree)[0];
        // TODO: figure out an automated way to pick up the return statement within the array without resorting to last index
        const returnStatement = exportObject.declaration.body.body[exportObject.declaration.body.body.length - 1];
        const jsxElements = this.getJsxNodes(returnStatement.argument.children); //JSXElement
        // TODO: change from hardcoded 0th index
        // iterate through jsxelements, find node with router.push() callExpression
        // for each jsxelement, look at children and filter jsxelements again
        const nestedJsxElements = this.getJsxNodes(jsxElements[0].children);
        // then, for each jsxelement, look at JSXOpeningElement attributes property (array)
        for (let i = 0; i < nestedJsxElements.length; i++) {
            const innerNest = nestedJsxElements[i].openingElement.attributes;
            console.log('attributes: ', innerNest);
            // for each JSXAttribute, find JSXIdentifier with name === onClick
            for (let j = 0; j < innerNest.length; j++) {
                console.log('innernest[j]: ', innerNest[j]);
                console.log('innernest[j]: ', innerNest[j].value);
                // if name === onClick, match with value that is JSXExpressionContainer.expression.body.callee 
                if (innerNest[j].value.expression !== undefined) {
                    console.log('passed undefined conditional');
                    if (innerNest[j].value.expression.body.callee.object.name === "router") //"router"
                     
                    // innerNest[j].value.expression.body.callee.property.name //"push"
                    {
                        console.log('~~~~ENDPOINT~~~~~', innerNest[j].value.expression.body.arguments[0].value); //"/cats"
                        return innerNest[j].value.expression.body.arguments[0].value; //"/cats"
                    }
                }
            }
        }
        // two identifiers needed: one with name router, one with name push
        // find CallExpression.arguments.value (i.e. '/cats')
    }
    getChildrenComponents(jsxNodes, importNodes) {
        // console.log('more testing... ', jsxNodes, importNodes);
        const cache = this.mapComponentToFilepath(jsxNodes, importNodes);
        // TODO: handle cases like this: 
        // import Jumbotron from '../components/Nav/Jumbotron/Jumbotron.js
        // find label used for useRouter()
        // find [label].push
        // find string argument (e.g. '/cats')
        // find pages/cats/index.js
        // iterate through each key in cache
        // check if value starts with 'next'
        const cacheKeys = Object.keys(cache);
        // console.log('before for loop');
        for (let i = 0; i < cacheKeys.length; i++) {
            const filePath = cache[cacheKeys[i]];
            if (filePath.slice(0, 4) !== 'next' && filePath.slice(filePath.length - cacheKeys[i].length) === cacheKeys[i]) {
                // console.log('THE TEST STR: ', this.string);
                // -> /home/nicoflo/cats-app/pages/index.js
                let str = this.string.split('/pages')[0] + filePath.slice(2);
                // console.log('resultantStr: ', str);
                // /home/nicoflo/cats-app + /components/Nav/Jumbotron/Jumbotron
                // get all file paths, match name without extension (.ts, .js, .jsx)
                const extensions = ['.ts', '.js', '.jsx', '.tsx'];
                for (let j = 0; j < extensions.length; j++) {
                    const path = str + extensions[j];
                    // console.log('in J loop this: ', this);
                    if (fs.existsSync(path)) {
                        // console.log('exists: ', this);
                        const tree = this.getTree(path);
                        // console.log('*********TREE: ', tree);
                        const endpoint = this.getRouterEndpoint(tree); // '/cats'
                        console.log('endpoint: ', endpoint);
                        // with endpoint, use this.string to find /pages/cats/index.js
                        let fileToRecurse = this.string.split('/pages')[0] + `/pages${endpoint}/index.js`;
                        console.log('fileToRecurse: ', fileToRecurse);
                        console.log(this.getTree(fileToRecurse));
                        // recurse over new index.js
                        // store as newChildren
                        // {name: 'Jumbotron', props: {}, children: newChildren }
                    }
                    else {
                        // console.log('does not exist');
                    }
                }
            }
        }
    }
    main() {
        const importNodes = this.getImportNodes(this.programBody);
        // TODO: consider other file structures
        let exportDefaultNodes;
        exportDefaultNodes = this.getExportDefaultNodes(this.programBody);
        const childrenNodes = this.getChildrenNodes(exportDefaultNodes);
        const jsxNodes = this.getJsxNodes(childrenNodes); //Head, Nav, Jumbotron
        console.log('JSXNodes: ', jsxNodes);
        const result = this.getChildrenComponents(jsxNodes, importNodes);
        // Look at each element in array
        // check if there is an associated file with that component name
        // e.g. next/head vs ../components/jumbotron
        // LINK case: look at href tag
        // name: Link, children [Node(name: '/', children=[],props={})]
        // case '/': 
        // case '/{xyz}':
        // Nav (/components)
        //  -> Link (href = "/cats")
        //    -> /
        //    -> /cats (/pages/cats/index.js)
        //    -> Nav, Card (/components)
        // Jumbotron (/components/Jumbotron)
        //  -> /
        //  -> /cats (/pages/cats/index.js)
        //    -> Nav, Card (/components)
    }
}
exports.Parser = Parser;
//# sourceMappingURL=parserv2.js.map