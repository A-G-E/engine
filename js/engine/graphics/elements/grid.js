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
            #define POSITION_LOCATION 0
            
            precision highp float;
            
            layout(location = POSITION_LOCATION) in vec3 vertex;
            
            uniform mat4 world;
            uniform mat4 view;
            uniform mat4 projection;
            
            // out vec3 fragColor;
            
            void main() {
                // gl_Position = projection * view * world * vec4(vertex, 1.0);
                gl_Position = vec4(vertex, 1.0);
                // fragColor = vec3(0.2, 0.2, 0.2);
            }
        `;
        const f = `#version 300 es
            #define FRAG_COLOR_LOCATION 0
            
            precision highp float;
            
            // in vec3 fragColor;
            
            layout(location = FRAG_COLOR_LOCATION) out vec4 color;
            
            void main() {
                color = vec4(0.2, 0.2, 0.2, 1.0);
            }
        `;
    
        this.program = new Program(
            renderer,
            new Vertex(renderer, v),
            new Fragment(renderer, f)
        );
    
        this.buffer = [];
        // this.indices = [];
    
        this.buffer.push(0, 1, 0);
        this.buffer.push(0, -1, 0);
    
        let bv = new Buffer(renderer, [
            [ this.program['vertex'], 3 ],
        ]);
        bv.data = new Float32Array(this.buffer);
    
        // let bi = new Buffer(renderer, [], renderer.gl.ELEMENT_ARRAY_BUFFER);
        // bi.data = new Uint16Array(this.indices);
    
        let world = Matrix4.identity
        // .rotate(60, new Vector3(1, 0, 0))
        // .translate(new Vector3(-10, 0, -10));
    
        this.program.world = world.points;
        this.program.view = view.points;
        this.program.projection = projection.points;
    }

    render(renderer)
    {
        renderer.gl.drawArrays(renderer.gl.LINES, 0, 2);
        // renderer.gl.drawElements(renderer.gl.LINES, this.indices.length, renderer.gl.UNSIGNED_SHORT, 0);
    }
}
