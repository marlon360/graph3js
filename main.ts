import {GraphViewer} from './src/GraphViewer';

const graphViewer = new GraphViewer(document.body);
graphViewer.createGraph((x,y) => Math.sign(x) * (y / 2));