'use strict';

import Buffer from '../buffer.js';
import Program from '../program.js';
import Vertex from '../shaders/vertex.js';
import Fragment from '../shaders/fragment.js';
import {Vector2, Vector3, Matrix4, Plane} from '../../../math/exports.js';
import perlin from '../../../lib/perlin.js';

export default class Grid
{
    constructor(renderer, view, projection)
    {
        let load = p => fetch(p, {credentials: 'same-origin'}).then(r => r.text());
        
        const v = `#version 300 es
            
            precision mediump float;
            
            in vec3 vertex;
            
            uniform mat4 world;
            uniform mat4 view;
            uniform mat4 projection;
            
            void main() {
                // gl_Position = projection * view * world * vec4(vertex, 1.0);
                gl_Position = vec4(vertex, 1.0);
            }
        `;
        const f = `#version 300 es
            
            precision mediump float;
            
            out vec4 color;
            
            void main() {
                color = vec4(0, 1, 0, 1.0);
            }
        `;
    
        this.program = new Program(
            renderer,
            new Vertex(renderer, v),
            new Fragment(renderer, f)
        );
    
        this.buffer = [];
    
        this.buffer.push(0, 0, 0);
        this.buffer.push(0, .5, 0);
        this.buffer.push(.7, 0, 0);
    
        let bv = new Buffer(renderer, [
            [ this.program['vertex'], 3 ],
        ]);
        bv.data = new Float32Array(this.buffer);
    
        let world = Matrix4.identity;
    
        this.program.world = world.points;
        this.program.view = view.points;
        this.program.projection = projection.points;
    }

    render(renderer)
    {
        renderer.gl.drawArrays(renderer.gl.TRIANGLES, 0, 3);
        // renderer.gl.drawElements(renderer.gl.LINES, this.indices.length, renderer.gl.UNSIGNED_SHORT, 0);
    }
}
