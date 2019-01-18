import Renderable from './renderable.js';

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
        float brightness = max(dot(-lightDirection, normalize(normal) * 0.5 - 0.5), 0.0);
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
        color = vec4(.8, .5, .8, 1.0) + vec4(v_color * 0.2, 1.0);
    }
`;

export default class Obj extends Renderable
{
    constructor(renderer, content)
    {
        let vertices = [];
        let UVs = [];
        let normals = [];
        let faces = [];
        let buffer = [];
        let indices = [];

        for(const [ type, ...args ] of content.split('\n').map(l => l.split(' ')))
        {
            switch(type)
            {
                case 'v':
                    vertices.push(args.map(a => Number.parseFloat(a)));
                    break;

                case 'vt':
                    UVs.push(args.map(a => Number.parseFloat(a)));
                    break;

                case 'vn':
                    normals.push(args.map(a => Number.parseFloat(a)));
                    break;

                case 'f':
                    faces.push(args.map(a => a.split('/').map(i => Number.parseInt(i) - 1)));
                    break;
            }
        }

        for(const set of faces)
        {
            for(const [ v, vt, vn ] of set)
            {
                indices.push(v);
                buffer.push(...vertices[v]);

                if(Number.isNaN(vt) === false)
                {
                    buffer.push(...UVs[vt]);
                }

                buffer.push(...normals[vn]);
            }
        }

        super(renderer, v, f, buffer, indices);
    }
}