'use strict';

import * as Fyn from 'http://fyn-software.cpb/component/fyn.js';
import Renderer from './graphics/renderer.js';
import Terrain from './graphics/elements/terrain.js';
import Grid from './graphics/elements/grid.js';
import { Vector3, Matrix4 } from '../math/exports.js';

export default class Game extends Fyn.Component
{
    ready()
    {
        const renderer = new Renderer(this);
    
        this.shadow.appendChild(renderer.canvas);
    
        let view = Matrix4.lookAt(
            new Vector3(0, 0, -15),
            new Vector3(0, 0, 0),
            new Vector3(0, -1, 0)
        );
        let projection = Matrix4.perspective(90 * Math.PI / 180, this.clientWidth / this.clientHeight, 0.1, 1000.0);
        // let terrain = new Terrain(renderer, new Vector2(20, 20), view, projection);
        let grid = new Grid(renderer, view, projection);
    
        // renderer.add(terrain);
        renderer.add(grid);
        renderer.play();
    }
}
