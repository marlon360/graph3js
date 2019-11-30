import { GraphViewer } from './src/GraphViewer';
import { Parser } from 'expr-eval';

const graphViewer = new GraphViewer(document.body);

function drawGraph() {
    const funcInputElement = document.getElementById("func-input") as HTMLInputElement;
    const funcText = funcInputElement.value;
    const zFunc = Parser.parse(funcText).toJSFunction("x, y");
    graphViewer.createGraph((x, y) => zFunc(x, y));
}

document.getElementById("func-button").onclick = drawGraph;

drawGraph();