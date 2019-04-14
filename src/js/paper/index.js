import { ROOT_SELECTOR_ID } from '../utils';
import { fn } from './hit-testing';

import '../../css/main.css';

const div = document.querySelector(ROOT_SELECTOR_ID);
div.setAttribute('class', 'paper-canvas-container');

const canvas = document.createElement('canvas');
canvas.setAttribute('width', '600');
canvas.setAttribute('height', '400');
const canvasName = 'paper-canvas';
canvas.setAttribute('id', canvasName);

div.appendChild(canvas);

fn(canvasName);

export { fn };
