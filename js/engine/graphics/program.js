import Shader from './shader.js';
import Vertex from './shaders/vertex.js';
import Ubo from './ubo.js';

const typeSize = {
    bool: 1,
    int: 1,
    uint: 1,
    float: 1,
    double: 1,
    vec2: 2,
    vec3: 3,
    vec4: 4,
    mat2: 4,
    mat3: 9,
    mat4: 16,
};

export default class Program
{
    #context;
    #program;
    #variables;
    
    constructor(context, ...shaders)
    {
        this.#context = context;
        this.#program = context.createProgram();
        this.#variables = {};

        shaders.forEach(s => this.attach(s));

        this.#context.linkProgram(this.#program);

        if(this.#context.getProgramParameter(this.#program, this.#context.LINK_STATUS) === false)
        {
            console.log(this.#context.getProgramInfoLog(this.#program));

            throw new Error('linking the shader-program has failed');
        }

        this.#context.validateProgram(this.#program);

        if(this.#context.getProgramParameter(this.#program, this.#context.VALIDATE_STATUS) === false)
        {
            throw new Error('validating the shader-program has failed');
        }

        const ins = shaders
            .filter(s => s instanceof Vertex)
            .map(s => s.src
                .split('\n')
                .map(l => l.trim().match(/(in)\s+([a-z][a-zA-Z0-9]+)\s+([a-zA-Z0-9_]+);/))
                .filter(l => l !== null)
            )
            .reduce((t, a) => [ ...t, ...a ], []);

        const uniforms = shaders
            .map(s => s.src
                .split('\n')
                .map(l => l.trim().match(/(uniform)\s+([a-z][a-zA-Z0-9]+)\s+([a-zA-Z0-9_]+);/))
                .filter(l => l !== null)
            )
            .reduce((t, a) => [ ...t, ...a ], []);

        const matches = [...ins, ...uniforms];

        let blocks = shaders
            .map(s => s.src.match(/uniform\s+([a-z][a-z0-9]+)\s*{\s*[^}]+\s*}\s*([a-z][a-z0-9]+)?;/g))
            .filter(l => l !== null)
            .reduce((t, a) => [ ...t, ...a ], [])
            .map(m => m.match(/uniform\s+([a-z][a-z0-9]+)\s*{\s*[^}]+\s*}\s*([a-z][a-z0-9]+)?;/)[1]);

        for(let block of blocks)
        {
            this.#context.uniformBlockBinding(
                this.#program,
                this.#context.getUniformBlockIndex(this.#program, block),
                Ubo.get(block).index
            );
        }

        for(let [ , modifier, type, name ] of matches)
        {
            let f;

            switch(modifier)
            {
                case 'in':
                    f = 'Attribute';

                    break;

                default:
                    f = modifier.capitalize();

                    break;
            }

            this.#variables[name] = [ f, type, this[`get${f}Location`](name), typeSize[type] ];
        }

        const self = this;

        return new Proxy(this, {
            get: (c, p) =>
            {
                if(p in self)
                {
                    return typeof self[p] === 'function'
                        ? self[p].bind(self)
                        : self[p];
                }

                return self.#variables.hasOwnProperty(p)
                    ? self.#variables[p][2]
                    : undefined;
            },
            set: (c, p, v) =>
            {
                if(p in self)
                {
                    self[p] = v;

                    return true;
                }

                if(!self.#variables.hasOwnProperty(p))
                {
                    return false;
                }

                let [ modifier, type, location ] = self.#variables[p];

                self.#context.useProgram(self.#program);

                switch(modifier)
                {
                    case 'Uniform':
                        let t;
                        let a;
                        let s;

                        if(type.startsWith('mat'))
                        {
                            t = 'Matrix';
                            a = [ location, false, v ];
                        }
                        else
                        {
                            t = '';
                            a = [ location, v ];
                        }

                        if(type === 'sampler2D')
                        {
                            s = 'uniform1i';
                        }
                        else
                        {
                            s = `uniform${t}${type.match(/[0-9]/)}fv`;
                        }

                        self.#context[s](...a);

                        return true;

                    default:
                        return false;
                }
            },
            has: (c, p) => self.#variables.hasOwnProperty(p),
        });
    }

    attach(shader)
    {
        if(typeof shader !== 'object')
        {
            throw new Error('Expected instance of Shader, got non object');
        }

        if(!(shader instanceof Shader))
        {
            throw new Error(`Expected instance of Shader, got ${shader.constructor.name}`);
        }

        this.#context.attachShader(this.#program, shader.shader);
    }

    use()
    {
        this.#context.useProgram(this.#program);
    }

    getAttributeLocation(loc)
    {
        return this.#context.getAttribLocation(this.#program, loc);
    }

    getUniformLocation(loc)
    {
        return this.#context.getUniformLocation(this.#program, loc);
    }

    get program()
    {
        return this.#program;
    }

    get attributes()
    {
        return Object.values(this.#variables).filter(v => v[0] === 'Attribute').map(v => v.slice(2));
    }

    get uniforms()
    {
        return Object.values(this.#variables).filter(v => v[0] === 'Uniform').map(v => v.slice(2));
    }
}
