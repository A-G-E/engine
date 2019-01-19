import Renderable from '../renderable.js';
import { Matrix4 } from '../../../math/exports.js';

const v = `#version 300 es
    precision mediump float;
    
    in vec3 vertex;
    in vec3 normal;
    
    uniform mat4 world;
    
    uniform camera{
        mat4 view;
        mat4 projection;
    };
    
    out vec3 v_normal;
    
    void main(void) {           
        v_normal = (world * vec4(normal, 1.0)).xyz;
        
        gl_Position = projection * view * world * vec4(vertex, 1.0);
    }
`;
const f = `#version 300 es
    precision mediump float;
    
    in vec3 v_normal;
    
    const vec3 baseColor = vec3(.8, .5, .8);
    
    uniform lighting{
        vec3 position;
        vec3 color;
    } light;
                
    out vec4 color;
    
    void main(void) {
        float diffAngle = max(dot(v_normal, normalize(light.position - v_normal)), 0.0);
        color = vec4(baseColor + light.color * diffAngle, 1.0);
    }
`;

export default class Bone extends Renderable
{
    constructor(renderer)
    {
        super(renderer, v, f, [
               0,  0,    0,     0, -1,  0,
             .25, .5,  .25,     0,  0, -1,
            -.25, .5,  .25,     0, -1,  0,
            -.25, .5, -.25,     0,  0,  1,
             .25, .5, -.25,     0,  1,  0,
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
}
