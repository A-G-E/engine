import Renderable from '../renderable.js';
import Vao from '../vao.js';

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
    static componentToArrayTypeMap = {
        5120: Int8Array,    // Byte
        5121: Uint8Array,   // Unsigned byte
        5122: Int16Array,   // Short
        5123: Uint16Array,  // Unsigned short
        5124: Int32Array,   // Int
        5125: Uint32Array,  // Unsigned int
        5126: Float32Array, // Float
    };
    static componentLengthMap = {
        SCALAR: 1,
        VEC2: 2,
        VEC3: 3,
        VEC4: 4,
        MAT2: 4,
        MAT3: 9,
        MAT4: 16,
    };

    #mesh;
    #skin;
    #armature;
    #primitives = [];

    constructor(context, path)
    {
        super(context);
        super.init(v, f);

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

        const scene = content.scenes[content.scene];

        const parseAccessor = index => {
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
                    drawType: 'arrays',
                    offset: (accessor.byteOffset ?? 0) + (bufferView.byteOffset ?? 0),
                    length: bufferView.byteLength / type.BYTES_PER_ELEMENT,
                    get dataView()
                    {
                        return new DataView(binary, this.offset, bufferView.byteLength);
                    },
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
                    primitive.indices.drawType = 'elements';
                }

                for(const [ type, value ] of Object.entries(primitive.attributes))
                {
                    primitive[type.match(/^[a-z]+/i)[0].toLowerCase()] = parseAccessor(value);
                }

                delete primitive.attributes;

                const buffer = new Float32Array(primitive.position.length * 2);
                const position = primitive.position.data;
                const normal = primitive.normal.data;

                for(let i = 0; i < buffer.length; i += 3)
                {
                    buffer[i * 2 + 0] = position[i + 0];
                    buffer[i * 2 + 1] = position[i + 1];
                    buffer[i * 2 + 2] = position[i + 2];
                    buffer[i * 2 + 3] = normal[i + 0];
                    buffer[i * 2 + 4] = normal[i + 1];
                    buffer[i * 2 + 5] = normal[i + 2];
                }

                primitive.vao = new Vao(this.context, this.program);
                primitive.vao.indices = primitive.indices.data;
                primitive.vao.vertex = primitive.position;
                primitive.vao.normal = primitive.normal;

                this.#primitives.push(primitive);
            }
        }
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