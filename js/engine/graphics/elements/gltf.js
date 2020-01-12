import Renderable from '../renderable.js';
import Vao from '../vao.js';
import { Matrix4 } from '../../../math/exports.js';

const v = `#version 300 es
    precision mediump float;
    
    in vec3 position;
    in vec3 normal;
    
    uniform mat4 world;
    
    uniform camera{
        mat4 view;
        mat4 projection;
    };
    
    out vec3 v_normal;
    
    void main(void) {
        v_normal = (world * vec4(normal, 1.0)).xyz;
        
        gl_Position = projection * view * world * vec4(position, 1.0);
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

const files = new Map();
const download = async file => {
    if(files.has(file) === false)
    {
        files.set(file, fetch(file).then(r => r.arrayBuffer()));
    }

    return files.get(file);
};

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
    static componentToGetterMap = {
        5120: 'getInt8',    // Byte
        5121: 'getUint8',   // Unsigned byte
        5122: 'getInt16',   // Short
        5123: 'getUint16',  // Unsigned short
        5124: 'getInt32',   // Int
        5125: 'getUint32',  // Unsigned int
        5126: 'getFloat32', // Float
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

    baseMatrix = Matrix4.identity;

    constructor(context, path, name)
    {
        super(context);
        super.init(v, f);

        this.parse(path, name);
    }

    async parse(path, name)
    {
        const content = await fetch(`${path}${name}.gltf`).then(r => r.json());

        if(content.asset.version !== '2.0')
        {
            throw new Error('this class is only able to handle gltf 2.0 standard');
        }

        const scene = content.scenes[content.scene];

        console.log(content);

        const parseAccessor = async index => {
            const accessor = content.accessors[index];
            const bufferView = content.bufferViews[accessor.bufferView];
            const buffer = content.buffers[bufferView.buffer];

            // TODO(Chris Kruining) Implement data url handling
            const binary = await download(path + buffer.uri);

            if(Gltf.componentToArrayTypeMap.hasOwnProperty(accessor.componentType) === false)
            {
                throw new Error(`Unknown componentType '${accessor.componentType}'`);
            }

            const type = Gltf.componentToArrayTypeMap[accessor.componentType];
            const getter = Gltf.componentToGetterMap[accessor.componentType];

            return {
                accessor,
                bufferView,
                type,
                binary,
                target: bufferView.target ?? this.context.ARRAY_BUFFER,
                offset: (accessor.byteOffset ?? 0) + (bufferView.byteOffset ?? 0),
                length: bufferView.byteLength / type.BYTES_PER_ELEMENT,
                get dataView()
                {
                    if(bufferView.hasOwnProperty('byteStride') === false)
                    {
                        return new DataView(this.binary, this.offset, bufferView.byteLength);
                    }

                    const array = new this.type(this.length);
                    const bufferOffset = bufferView.byteOffset ?? 0;
                    const strideOffset = accessor.byteOffset ?? 0;
                    const dataView = new DataView(this.binary);
                    let j, k = 0, p = 0;

                    for(let i = 0; i < accessor.count; i++)
                    {
                        p = bufferOffset + (bufferView.byteStride * i) + strideOffset;

                        for(j = 0; j < this.length; j++)
                        {
                            array[k++] = dataView[getter](p + (j * type.BYTES_PER_ELEMENT), true);
                        }
                    }

                    return array;
                },
                get data()
                {
                    if(bufferView.hasOwnProperty('byteStride'))
                    {
                        return this.dataView;
                    }

                    return new type(this.binary, this.offset, this.length);
                }
            };
        };

        for(const index of scene.nodes)
        {
            const armature = content.nodes[index];
            const node = content.nodes[armature.children.find(c => content.nodes[c].hasOwnProperty('mesh'))];
            const mesh = content.meshes[node.mesh];
            const skin = content.skins[node.skin];

            if(node.hasOwnProperty('matrix'))
            {
                // TODO(Chris Kruining) Implement matrix interpretation
                // this.baseMatrix = new Matrix4.fromColumnMajor(node.matrix);
            }

            for(const p of mesh.primitives)
            {
                const vao = new Vao(this.context, this.program, p.mode ?? this.context.TRIANGLES);

                if(p.hasOwnProperty('indices'))
                {
                    vao.indices = (await parseAccessor(p.indices)).data;
                }

                for(const [ attribute, accessor ] of Object.entries(p.attributes))
                {
                    vao[attribute.match(/^[a-z]+/i)[0].toLowerCase()] = await parseAccessor(accessor);
                }

                this.#primitives.push(vao);
            }
        }
    }

    render(renderer)
    {
        for(const vao of this.#primitives)
        {
            vao.draw();
        }
    }
}