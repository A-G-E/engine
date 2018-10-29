'use strict';

import Renderer from './graphics/renderer.js';
import Buffer from './graphics/buffer.js';
import Program from './graphics/program.js';
import Vertex from './graphics/shaders/vertex.js';
import Fragment from './graphics/shaders/fragment.js';
import { Vector2, Vector3, Matrix4 } from '../math/exports.js';

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
            
            let t = [], tc = [], z = 1.0;
            let s = new Vector2(10, 10);
            
            for(let y = 0.0; y < s.y; y++)
            {
                for(let x = 0.0; x < s.x; x++)
                {
                    tc.push(x / s.x, y / s.y, z);
                    tc.push(x / s.x, y / s.y, z);
                    tc.push(x / s.x, y / s.y, z);
                    
                    t.push(    x,     y, z);
                    t.push(    x, y + 1, z);
                    t.push(x + 1,     y, z);
                }
            }
            
            // console.log(t);
            
            let p = new Buffer(renderer, 'position', 3);
            p.data = t;
            p.activate();
            
            let c = new Buffer(renderer, 'color', 3);
            c.data = tc;
            c.activate();
            
            let world = Matrix4.identity.rotate(-60, new Vector3(1, 0, 0));
            let view = Matrix4.lookAt(
                new Vector3(0,  0, -8),
                new Vector3(0,  0,  0),
                new Vector3(0, -1,  0)
            );
            let projection = Matrix4.perspective(90 * Math.PI / 180, this.clientWidth / this.clientHeight, 0.1, 1000.0);
            
            renderer.program.world = world.points;
            renderer.program.view = view.points;
            renderer.program.projection = projection.points;
            
            let angle = 0;
            
            renderer.add({
                render()
                {
                    angle = performance.now() / 250 * Math.PI;
                    renderer.program.world = world.rotate(-angle, new Vector3(0, 0, 1)).translate(new Vector3(-s.x / 2, -s.y / 2, 0.0)).points;
                    
                    renderer.gl.drawArrays(renderer.gl.TRIANGLES, 0, 300);
                }
            });
            renderer.play();
        });
    }
}