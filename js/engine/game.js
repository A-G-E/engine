'use strict';

import Renderer from './graphics/renderer.js';
import Buffer from './graphics/buffer.js';
import Program from './graphics/program.js';
import Vertex from './graphics/shaders/vertex.js';
import Fragment from './graphics/shaders/fragment.js';
import { Vector3, Matrix4 } from '../math/exports.js';

export default class Game extends HTMLElement
{
    constructor()
    {
        super();
    }
    
    connectedCallback()
    {
        let load = p => fetch(p, {credentials: 'same-origin'}).then(r => r.text());
    
        Promise.all([
            load('vertex.glsl'),
            load('fragment.glsl'),
        ]).then(([v, f]) => {
            const shadowRoot = this.attachShadow({mode: 'open'});
            const renderer = new Renderer(this);
            renderer.program = new Program(
                renderer,
                new Vertex(renderer, v),
                new Fragment(renderer, f)
            );
    
            shadowRoot.appendChild(renderer.canvas);
            
            let p = new Buffer(renderer, 'position', 3);
            p.data = [
                 0.0,  0.5, 0.0,
                -0.5, -0.5, 0.0,
                 0.5, -0.5, 0.0,
            ];
            p.activate();
            
            let c = new Buffer(renderer, 'color', 3);
            c.data = [
                0, 0, 1,
                0, 1, 0,
                1, 0, 0,
            ];
            c.activate();
            
            renderer.gl.useProgram(renderer.program.program);
            renderer.play();
            
            let view = Matrix4.lookAt(
                new Vector3(0, 0, -8),
                new Vector3(0, 0, 0),
                new Vector3(0, 1, 0)
            );
            let projection = Matrix4.perspective(45 * Math.PI / 180, renderer.width / renderer.height, 0.1, 1000.0);
            renderer.program.world = Matrix4.identity.points;
            // renderer.program.view = Matrix4.identity.points;
            // renderer.program.projection = Matrix4.identity.points;
            renderer.program.view = view.points;
            renderer.program.projection = projection.points;
            
            renderer.add({
                render()
                {
                    
                    renderer.gl.drawArrays(renderer.gl.TRIANGLES, 0, 3);
                }
            });
        });
    }
}