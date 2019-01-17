import Renderable from '../renderable.js';
import { Matrix4, Vector3 } from '../../../math/exports.js';

const v = `#version 300 es
    precision mediump float;
    
    in vec3 vertex;
    in vec3 normal;
    
    uniform mat4 world;
    
    uniform camera{
        mat4 view;
        mat4 projection;
    };
    
    uniform light{
        vec3 lightDirection;
        vec3 lightColour;
        vec2 lightBias;
    };
    
    flat out vec3 v_color;
    
    vec3 calculateLighting(){
        float brightness = max(dot(-lightDirection, normal), 0.0);
        return (lightColour * lightBias.x) + (brightness * lightColour * lightBias.y);
    }
    
    void main(void) {           
        v_color = calculateLighting();
        
        gl_Position = projection * view * world * vec4(vertex, 1.0);
    }
`;
const f = `#version 300 es
    precision mediump float;
    
    flat in vec3 v_color;
                
    out vec4 color;
    
    void main(void) {
        color = vec4(v_color, 1.0) * vec4(.8, .5, .8, 1.0);
    }
`;

export default class Bone extends Renderable
{
    constructor(renderer)
    {
        // const vertices = [
        //     new Vector3(0, 0, 0),
        //     new Vector3(.25, .5, .25),
        //     new Vector3(.25, .5, .25),
        //     new Vector3(-.25, .5, -.25),
        //     new Vector3(.25, .5, -.25),
        //     new Vector3(0, 2, 0),
        // ];
        //
        // const indices = [
        //     new Vector3(0, 1, 2),
        //     new Vector3(0, 2, 3),
        //     new Vector3(0, 3, 4),
        //     new Vector3(0, 4, 1),
        //     new Vector3(5, 1, 4),
        //     new Vector3(5, 4, 3),
        //     new Vector3(5, 3, 2),
        //     new Vector3(5, 2, 1),
        // ];
        //
        // super(renderer, v, f, [
        //     ...vertices[0], ...Vector3.normalFromPoints(...indices[0].points.map(i => vertices[i])),
        //     ...vertices[1], ...Vector3.normalFromPoints(...indices[1].points.map(i => vertices[i])),
        //     ...vertices[2], ...Vector3.normalFromPoints(...indices[2].points.map(i => vertices[i])),
        //     ...vertices[3], ...Vector3.normalFromPoints(...indices[3].points.map(i => vertices[i])),
        //     ...vertices[4], ...Vector3.normalFromPoints(...indices[4].points.map(i => vertices[i])),
        //     ...vertices[5], ...Vector3.normalFromPoints(...indices[5].points.map(i => vertices[i])),
        // ], indices.map(i => i.points));

        super(renderer, v, f, [
               0,  0,    0,     0, -1,  0,
             .25, .5,  .25,     0,  0, -1,
            -.25, .5,  .25,     0, -1,  0,
            -.25, .5, -.25,     0,  1,  0,
             .25, .5, -.25,     0,  0,  1,
               0,  2,    0,     0,  1,  0,
        ], [
            0, 1, 2,
            0, 2, 3,
            0, 3, 4,
            0, 4, 1,

            5, 1, 4,
            5, 4, 3,
            5, 3, 2,
            5, 2, 1,
        ]);

        this.program.world = Matrix4.identity.points;
    }

    render(renderer)
    {
        this.vao.draw(renderer.gl.TRIANGLES);
    }
}
