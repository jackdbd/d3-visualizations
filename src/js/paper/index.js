import { ROOT_SELECTOR_ID } from '../utils';
import { fn } from './hit-testing.js';

import "../../css/main.css"

const div = document.querySelector(ROOT_SELECTOR_ID);
div.setAttribute('class', 'paper-canvas-container')

const canvas = document.createElement("canvas");
canvas.setAttribute('width', '600px')
canvas.setAttribute('height', '400px')
const canvasName = 'paper-canvas'
canvas.setAttribute('id', canvasName)
canvas.setAttribute('class', 'paper-canvas')

div.appendChild(canvas)

fn(canvasName);

export { fn };
