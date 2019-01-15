import Shader from './shader.js';
import Vertex from './shaders/vertex.js';

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
    constructor(renderer, ...shaders)
    {
        this.gl = renderer.gl;
        this._program = this.gl.createProgram();
        this._variables = {};

        shaders.forEach(s => this.attach(s));

        this.gl.linkProgram(this._program);

        if(this.gl.getProgramParameter(this._program, this.gl.LINK_STATUS) === false)
        {
            console.log(this.gl.getProgramInfoLog(this._program));

            throw new Error('linking the shader-program has failed');
        }

        this.gl.validateProgram(this._program);

        if(this.gl.getProgramParameter(this._program, this.gl.VALIDATE_STATUS) === false)
        {
            throw new Error('validating the shader-program has failed');
        }

        let matches = shaders
            .filter(s => s instanceof Vertex)
            .map(s => s.src
                .split('\n')
                .map(l => l.trim().match(/^(in|uniform)\s+([a-z][a-z0-9]+)\s+([a-zA-Z0-9_]+);$/))
                .filter(l => l !== null)
            )
            .reduce((t, a) => [ ...t, ...a ], []);

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

            this._variables[name] = [ f, type, this[`get${f}Location`](name), typeSize[type] ];
        }

        const self = this;

        return new Proxy(this, {
            get: (c, p) =>
            {
                if(p in self)
                {
                    return self[p];
                }

                return self._variables.hasOwnProperty(p)
                    ? self._variables[p][2]
                    : undefined;
            },
            set: (c, p, v) =>
            {
                if(p in self)
                {
                    self[p] = v;

                    return true;
                }

                if(!self._variables.hasOwnProperty(p))
                {
                    return false;
                }

                let [ modifier, type, location ] = self._variables[p];

                self.gl.useProgram(self._program);

                switch(modifier)
                {
                    case 'Uniform':
                        let t; let a;

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

                        self.gl[`uniform${t}${type.match(/[0-9]/)}fv`](...a);

                        return true;

                    default:
                        return false;
                }
            },
            has: (c, p) => self._variables.hasOwnProperty(p),
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

        this.gl.attachShader(this._program, shader.shader);
    }

    use()
    {
        this.gl.useProgram(this.program);
    }

    getAttributeLocation(loc)
    {
        return this.gl.getAttribLocation(this._program, loc);
    }

    getUniformLocation(loc)
    {
        return this.gl.getUniformLocation(this._program, loc);
    }

    get program()
    {
        return this._program;
    }

    get attributes()
    {
        return Object.values(this._variables).filter(v => v[0] === 'Attribute').map(v => v.slice(2));
    }

    get uniforms()
    {
        return Object.values(this._variables).filter(v => v[0] === 'Uniform').map(v => v.slice(2));
    }
}
