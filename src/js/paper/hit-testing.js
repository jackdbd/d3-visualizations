import { format } from 'd3-format';
import { select } from 'd3-selection';
import paper from 'paper';

import { pageHasLoaded } from '../utils';
import styles from './hit-testing.module.css';

const formatNum = format('.2f');

const addClosedPath = (centerPoint, maxRadius, numPoints, debug) => {
  const path = new paper.Path();
  path.closed = true;
  path.moveTo(centerPoint);

  for (let i = 0; i < numPoints; i += 1) {
    const stopPoint = new paper.Point({
      angle: (360 / numPoints) * i,
      length: maxRadius * 0.5 + Math.random() * maxRadius * 0.5,
    });
    const x = centerPoint.x + stopPoint.x;
    const y = centerPoint.y + stopPoint.y;
    path.lineTo(new paper.Point(x, y));
  }

  path.smooth();

  const lightness = (Math.random() - 0.5) * 0.4 + 0.4;
  const hue = Math.random() * 360;
  path.fillColor = { hue, saturation: 1, lightness };
  path.strokeColor = 'black';

  if (debug) {
    // Add a rect to highlight the center
    const widthRect = 20;
    const heightRect = 10;
    const xRect = centerPoint.x - widthRect / 2;
    const yRect = centerPoint.y - heightRect / 2;
    // Gotcha: unlike as in SVG, inPaper.js a Rectangle is NOT a primitive that
    // can be drawn. A Paper.js Rectangle is just an area.
    const rect = new paper.Rectangle(xRect, yRect, widthRect, heightRect);
    const pathRect = new paper.Path.Rectangle(rect);
    pathRect.strokeColor = 'red';

    // Add a circle to highlight the center
    const debugPoint = new paper.Point(centerPoint.x, centerPoint.y);
    const pathCircle = new paper.Path.Circle(debugPoint, 10);
    pathCircle.strokeColor = 'blue';
  }
};

const addPaths = (option, debug) => {
  const {
    maxPoints, maxRadius, minPoints, minRadius, numPaths,
  } = option;
  const rDelta = maxRadius - minRadius;
  const pDelta = maxPoints - minPoints;

  for (let i = 0; i < numPaths; i += 1) {
    const p = paper.Point.random();
    const { size } = paper.view;
    const center = new paper.Point(p.x * size.width, p.y * size.height);
    const r = minRadius + Math.random() * rDelta;
    const n = minPoints + Math.floor(Math.random() * pDelta);

    if (debug) {
      const debugMsg = `Create path ${i + 1}/${numPaths} (x=${formatNum(
        center.x,
      )}, y=${formatNum(center.y)}, radius=${formatNum(r)}, numPoints=${n})`;
      console.log(debugMsg);
    }

    addClosedPath(center, r, n, debug);
  }
};

export const fn = async (canvasName) => {
  // Paper.js code is tipically found within a window.onload event handler.
  // But I am not sure if this is really needed.
  await pageHasLoaded();

  const containerName = 'paper-canvas-container';
  select(`.${containerName}`).attr('class', styles[containerName]);
  select(`#${canvasName}`).attr('class', styles[canvasName]);

  paper.setup(canvasName);

  const option = {
    minPoints: 5,
    maxPoints: 15,
    minRadius: 30,
    maxRadius: 90,
    numPaths: 20,
  };
  const debug = true;
  addPaths(option, debug);

  const hitOptions = {
    fill: true,
    segments: true,
    stroke: true,
    tolerance: 5,
  };

  /**
   * Add a new Paper.js Tool to handle Paper.js events.
   *
   * Paper.js has its own events (that wrap the native DOM events).
   * To add a new event listener we need to create a Tool, a listener, and
   * attach the listener to the tool:
   *
   * tool.onMouseDown = listener;
   *
   * Attaching the event listener to the HTML element won't work, because the
   * listener would receive the native DOM event, not the Paper.js one.
   *
   * This will NOT work
   * canvas.addEventListener('mousedown', listener);
   *
   * @see http://paperjs.org/reference/tool/
   */
  const tool = new paper.Tool();

  const onMouseDown = (event) => {
    const hitResult = paper.project.hitTest(event.point, hitOptions);

    if (!hitResult) {
      return;
    }

    if (hitResult) {
      console.warn('hitResult', hitResult);
      const { area, bounds, segments } = hitResult.item;
      const obj = {
        area: formatNum(area),
        boundingBox: {
          area: formatNum(bounds.area),
          centerX: formatNum(bounds.centerX),
          centerY: formatNum(bounds.centerY),
        },
        numSegments: segments.length,
      };
      alert(JSON.stringify(obj, null, 4));
    }

    if (hitResult.type === 'fill') {
      paper.project.activeLayer.addChild(hitResult.item);
    }
  };

  const onMouseMove = (event) => {
    paper.project.activeLayer.selected = false;
    if (event.item) {
      // eslint-disable-next-line no-param-reassign
      event.item.selected = true;
    }
  };

  tool.onMouseDown = onMouseDown;
  tool.onMouseMove = onMouseMove;

  paper.view.draw();
};
