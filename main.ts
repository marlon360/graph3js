import { GraphViewer } from './src/GraphViewer';
import { Parser } from 'expr-eval';

const graphViewer = new GraphViewer(document.body);

function drawGraph() {
    const funcInputElement = document.getElementById("graph-input") as HTMLInputElement;
    const funcText = funcInputElement.value;
    const zFunc = Parser.parse(funcText).toJSFunction("x, y");
    graphViewer.createGraph((x, y) => zFunc(x, y));
}
function drawCurve() {
    const funcInputElement = document.getElementById("curve-input") as HTMLInputElement;
    const funcText = funcInputElement.value;
    const func = <(t: number) => Array<number>><unknown>Parser.parse(funcText).toJSFunction("t");
    graphViewer.createCurve((t) => func(t));
}

document.getElementById("graph-button").onclick = drawGraph;
document.getElementById("curve-button").onclick = drawCurve;

drawGraph();