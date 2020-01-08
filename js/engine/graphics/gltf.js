import Renderable from './renderable.js';
import { Matrix4, Vector3 } from '../../math/exports.js';
import Vao from './vao.js';

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
    
    const vec3 baseColor = vec3(.8, .8, .8);
    
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

export default class Gltf extends Renderable
{
    static TYPE_BYTE			= 5120;     // Mode Constants for GLTF and WebGL are identical
    static TYPE_UNSIGNED_BYTE	= 5121;     // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants
    static TYPE_SHORT			= 5122;
    static TYPE_UNSIGNED_SHORT	= 5123;
    static TYPE_UNSIGNED_INT	= 5125;
    static TYPE_FLOAT			= 5126;

    static COMP_SCALAR			= 1;		// Component Length based on Type
    static COMP_VEC2			= 2;
    static COMP_VEC3			= 3;
    static COMP_VEC4			= 4;
    static COMP_MAT2			= 4;
    static COMP_MAT3			= 9;
    static COMP_MAT4			= 16;

    static TARGET_ARY_BUF		= 34962;	// bufferview.target
    static TARGET_ELM_ARY_BUF	= 34963;

    static componentToArrayTypeMap = {
        [this.TYPE_FLOAT]: Float32Array,
        [this.TYPE_SHORT]: Int16Array,
        [this.TYPE_UNSIGNED_SHORT]: Uint16Array,
        [this.TYPE_UNSIGNED_INT]: Uint32Array,
        [this.TYPE_UNSIGNED_BYTE]: Uint8Array,
    };

    #mesh;
    #skin;
    #armature;
    #primitives = [];

    constructor(context, path)
    {
        super(context, v, f);

        this.parse(path);
    }

    async parse(path)
    {
        const content = await fetch(`${path}.gltf`).then(r => r.json());
        const binary = await fetch(`${path}.bin`).then(r => r.arrayBuffer());

        if(content.asset.version !== '2.0')
        {
            throw new Error('this class is only able to handle gltf 2.0 standard');
        }

        console.log(content);

        const scene = content.scenes[content.scene];

        const parseAccessor = (index) => {
            const accessor = content.accessors[index];
            const bufferView = content.bufferViews[accessor.bufferView];

            if(Gltf.componentToArrayTypeMap.hasOwnProperty(accessor.componentType) === false)
            {
                throw new Error(`Unknown componentType '${accessor.componentType}'`);
            }

            const type = Gltf.componentToArrayTypeMap[accessor.componentType];

            if(bufferView.hasOwnProperty('byteStride'))
            {
                throw new Error('Not implemented');
            }
            else
            {
                return {
                    accessor,
                    bufferView,
                    type,
                    typeName: type.name.substring(0, type.name.length - 5),
                    offset: (accessor.byteOffset ?? 0) + (bufferView.byteOffset ?? 0),
                    length: accessor.count * Gltf[`COMP_${accessor.type}`],
                    get data()
                    {
                        return new this.type(binary, this.offset, this.length);
                    },
                };
            }
        };

        for(const index of scene.nodes)
        {
            const armature = content.nodes[index];
            const node = content.nodes[armature.children[0]];
            const mesh = content.meshes[node.mesh];
            const skin = content.skins[node.skin];

            for(const primitive of mesh.primitives)
            {
                primitive.mode = primitive.mode ?? this.context.TRIANGLES;

                if(primitive.hasOwnProperty('indices'))
                {
                    primitive.indices = parseAccessor(primitive.indices);
                }

                for(const [ type, value ] of Object.entries(primitive.attributes))
                {
                    primitive[type.match(/^[a-z]+/i)[0].toLowerCase()] = parseAccessor(value);
                }

                delete primitive.attributes;

                // const indices = primitive.indices.data;
                // const buffer = new Float32Array(indices.length / 2);
                // const position = primitive.position.data;
                // const normal = primitive.normal.data;
                //
                // // console.log(position, normal);
                //
                // for(let i = 0; i < indices.length; i +=3)
                // {
                //     buffer[i + 0] = position[i];
                //     buffer[i + 1] = position[i + 1];
                //     buffer[i * 2] = position[i + 2];
                //     buffer[i * 3] = normal[i];
                //     buffer[i * 4] = normal[i + 1];
                //     buffer[i * 5] = normal[i + 2];
                // }

                // primitive.vao = new Vao(this.context, this.program.attributes, buffer, indices);
                primitive.vao = new Vao(this.context, this.program.attributes, primitive.position.data, primitive.indices.data);

                this.#primitives.push(primitive);

                console.log(primitive);

                this.vertices = primitive.position.data;
                this.indices = primitive.indices.data;
            }
        }

        const node = content.nodes.find(n => n.name === 'Vegeta');
    }

    render(renderer)
    {
        for(const primitive of this.#primitives)
        {
            // primitive.vao.draw(this.context.LINES);
            primitive.vao.draw(primitive.mode);
        }
    }
}