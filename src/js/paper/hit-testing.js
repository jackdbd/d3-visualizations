import paper from "paper";
import styles from './hit-testing.module.css';

/**
 * Promise that resolves when all resources of the page have been loaded.
 * 
 * @see https://stackoverflow.com/questions/2414750/difference-between-domcontentloaded-and-load-events
 */
const pageHasLoaded = () => {
  const promise = new Promise((resolve, reject) => {
    const onLoad = () => {
      resolve(true)
    }
    const onError = (event) => {
      console.error(event)
      reject("Something went wrong")
    }
    window.onload = onLoad;
    window.onerror = onError;
  })
  return promise
}

export const fn = async (canvasName) => {
  await pageHasLoaded()
  paper.setup(canvasName);
  const path = new paper.Path();
  path.strokeColor = 'black';

  const start = new paper.Point(100, 100);
  path.moveTo(start);
  path.lineTo(start.add([ 200, -50 ]));

  const myCircle = new paper.Path.Circle(new paper.Point(100, 70), 50);
  myCircle.fillColor = 'black';

  const decagon = new paper.Path.RegularPolygon(new paper.Point(200, 70), 10, 50);
  decagon.fillColor = '#e9e9ff';
  decagon.selected = true;

  const tool = new paper.Tool();
  let pathTool;
		
  tool.onMouseDown = function(event) {
    // console.warn('onMouseDown event', event)
    pathTool = new paper.Path();
    pathTool.strokeColor = 'red';
    pathTool.add(event.point);
  }

  tool.onMouseDrag = function(event) {
    pathTool.add(event.point);
  }

  paper.view.draw()
}
