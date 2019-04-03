import {
  draw as drawClosestPoint,
  drawVoronoi as drawClosestPointVoronoi,
} from './closest-point';

export const selector = '#closest-point';
drawClosestPoint(selector);

export const selectorVoronoi = '#closest-point-voronoi';
drawClosestPointVoronoi(selectorVoronoi);

export { drawClosestPoint, drawClosestPointVoronoi };
