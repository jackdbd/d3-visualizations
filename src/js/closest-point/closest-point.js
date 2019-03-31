const d3 = Object.assign({}, require('d3-selection'), require('d3-shape'));
import styles from './closest-point.module.css';

const points = [
  [474, 276],
  [586, 393],
  [378, 388],
  [338, 323],
  [341, 138],
  [547, 252],
  [589, 148],
  [346, 227],
  [365, 108],
  [562, 62],
];

export const draw = selector => {
  const margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40,
  };

  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svg = d3
    .selectAll(selector)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('class', styles.frame)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.right})`);

  const lineGenerator = d3.line().curve(d3.curveCardinal);

  const path = svg
    .append('path')
    .attr('class', styles.examplePath)
    // set this path's bound data to the line generator
    .datum(points)
    .attr('d', lineGenerator);

  const line = svg.append('line').attr('class', styles.exampleLine);

  const circle = svg
    .append('circle')
    .attr('cx', -10)
    .attr('cy', -10)
    .attr('r', 3.5);

  function handleMouseMove() {
    const [evX, evY] = d3.mouse(this);

    const [x, y] = closestPoint(path.node(), [evX, evY]);

    // console.warn('mousemove', evX, evY, x, y);

    line
      .attr('x1', x)
      .attr('y1', y)
      .attr('x2', evX)
      .attr('y2', evY);

    circle.attr('cx', x).attr('cy', y);
  }

  // append a rect element to capture mouse events
  svg
    .append('rect')
    .attr('class', styles.overlay)
    .attr('width', width)
    .attr('height', height)
    .on('mousemove', handleMouseMove);
};

function closestPoint(pathNode, eventPoint) {
  const pathLength = pathNode.getTotalLength();
  let precision = 8;
  let best;
  let bestLength;
  let bestDistance = Infinity;

  // linear scan for coarse approximation
  let scanPoint;
  let scanLength;
  let scanDistance;
  for (
    scanPoint = {}, scanLength = 0, scanDistance = 0;
    scanLength <= pathLength;
    scanLength += precision
  ) {
    // https://developer.mozilla.org/en-US/docs/Web/API/SVGPathElement/getPointAtLength#Browser_compatibility
    scanPoint = pathNode.getPointAtLength(scanLength);
    scanDistance = distance2(scanPoint, eventPoint);

    if (scanDistance < bestDistance) {
      best = scanPoint;
      bestLength = scanLength;
      bestDistance = scanDistance;
    }
  }

  // binary search for precise estimate
  precision /= 2;
  while (precision > 0.5) {
    let before;
    let after;
    let beforeLength;
    let afterLength;
    let beforeDistance;
    let afterDistance;

    beforeLength = bestLength - precision;
    before = pathNode.getPointAtLength(beforeLength);
    beforeDistance = distance2(before, eventPoint);

    afterLength = bestLength + precision;
    after = pathNode.getPointAtLength(afterLength);
    afterDistance = distance2(after, eventPoint);

    if (beforeLength >= 0 && beforeDistance < bestDistance) {
      best = before;
      bestLength = beforeLength;
      bestDistance = beforeDistance;
    } else if (afterLength <= pathLength && afterDistance < bestDistance) {
      best = after;
      bestLength = afterLength;
      bestDistance = afterDistance;
    } else {
      precision /= 2;
    }
  }

  best = [best.x, best.y];
  best.distance = Math.sqrt(bestDistance);
  return best;
}

function distance2(p0, p1) {
  const [x1, y1] = p1;
  const dx = p0.x - x1;
  const dy = p0.y - y1;
  return dx * dx + dy * dy;
}
