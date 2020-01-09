import { Matrix4, Vector3 } from '../../../math/exports.js';
import Renderable from '../renderable.js';

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
    
    const vec3 baseColor = vec3(.2, .8, .2);
    
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
const parse = content => {
    const vertices = [];
    const UVs = [];
    const normals = [];
    const faces = [];

    for(const [type, ...args] of content.split('\n').map(l => l.split(' ')))
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

    return [ vertices, UVs, normals, faces ];
};

export default class Obj extends Renderable
{
    constructor(context, content)
    {
        super(context);
        super.init(v, f);

        const [ vertices, UVs, normals, faces ] = parse(content);
        let indices = [];
        let vertex = [];
        let normal = [];
        let i = 0;

        for(const set of faces)
        {
            for(const [ v, vt, vn ] of set)
            {
                indices.push(i);
                vertex.push(...vertices[v]);
                normal.push(...normals[vn]);

                i++;
            }
        }

        this.vao.indices = indices;
        this.vao.vertex = { dataView: new Float32Array(vertex) };
        this.vao.normal = { dataView: new Float32Array(normal) };
    }
}