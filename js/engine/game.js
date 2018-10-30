'use strict';

import Renderer from './graphics/renderer.js';
import Terrain from './graphics/elements/terrain.js';

import Buffer from './graphics/buffer.js';
import Program from './graphics/program.js';
import Vertex from './graphics/shaders/vertex.js';
import Fragment from './graphics/shaders/fragment.js';
import { Vector2, Vector3, Matrix4, Plane } from '../math/exports.js';
import perlin from '../lib/perlin.js';

export default class Game extends HTMLElement
{
    constructor()
    {
        super();
    }
    
    connectedCallback()
    {
        const shadowRoot = this.attachShadow({mode: 'open'});
        const renderer = new Renderer(this);
    
        shadowRoot.appendChild(renderer.canvas);
    
        let view = Matrix4.lookAt(
            new Vector3(0, 0, 1),
            new Vector3(0, 0, 0),
            new Vector3(0, 1, 0)
        );
        let projection = Matrix4.perspective(90 * Math.PI / 180, this.clientWidth / this.clientHeight, 0.1, 1000.0);
        let terrain = new Terrain(renderer, new Vector2(4, 4), view, projection);
    
        renderer.add(terrain);
        renderer.play();
    }
}