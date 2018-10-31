'use strict';

import Renderer from './graphics/renderer.js';
import Terrain from './graphics/elements/terrain.js';
import { Vector2, Vector3, Matrix4 } from '../math/exports.js';

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
            new Vector3(0, 0, 5),
            new Vector3(0, 0, 0),
            new Vector3(0, 1, 0)
        );
        let projection = Matrix4.perspective(90 * Math.PI / 180, this.clientWidth / this.clientHeight, 0.1, 1000.0);
        let terrain = new Terrain(renderer, new Vector2(2, 2), view, projection);
    
        renderer.add(terrain);
        renderer.play();
    }
}