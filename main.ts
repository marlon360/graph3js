import { GraphViewer } from './src/GraphViewer';
import { Parser } from 'expr-eval';
import { MathParser } from './src/MathParser';

const graphViewer = new GraphViewer(document.body);

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

function setInputValue(input: string) {
    const funcInputElement = document.getElementById("graph-input") as HTMLInputElement;
    funcInputElement.value = input;
}

function drawGraph() {
    const funcInputElement = document.getElementById("graph-input") as HTMLInputElement;
    const funcText = funcInputElement.value;
    const parseResult = MathParser.parse(funcText);
    if (parseResult.inputSize == 2 && parseResult.outputSize == 1) {
        graphViewer.createGraph((x, y) => parseResult.func(x, y));
    } else if (parseResult.inputSize == 1) {
        graphViewer.createCurve((t) => parseResult.func(t));
    }
}

document.getElementById("graph-button").onclick = drawGraph;

const funcParameter = findGetParameter("func");
if (funcParameter != null) {
    setInputValue(decodeURIComponent(funcParameter));
}

drawGraph();