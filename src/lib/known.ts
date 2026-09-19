import { parseShapes } from '../engine/voicing';
import myShapes from '../engine/my-shapes.txt?raw';
import bundledShapes from '../engine/bundled-shapes.txt?raw';

// standard tuning only; the owner's shapes come last so they win a shared fingering, and rank above the bundled ones
export const KNOWN = [...parseShapes(bundledShapes, 1.5), ...parseShapes(myShapes)];
