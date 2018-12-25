'use strict';

import Shader from './shader.js';
import Vertex from './shaders/vertex.js';

export default class Program
{
    constructor(renderer, ...shaders)
    {
        this.gl = renderer.gl;
        this._program = this.gl.createProgram();
        this._variables = {};
        
        shaders.forEach(s => this.attach(s));

        this.gl.linkProgram(this._program);
        
        if(!this.gl.getProgramParameter(this._program, this.gl.LINK_STATUS))
        {
            console.log(this.gl.getProgramInfoLog(this._program));
            
            throw new Error('linking the shader-program has failed');
        }
    
        this.gl.validateProgram(this._program);
        
        if(!this.gl.getProgramParameter(this._program, this.gl.VALIDATE_STATUS))
        {
            throw new Error('validating the shader-program has failed');
        }
        
        let matches = shaders
            .filter(s => s instanceof Vertex)
            .map(s => s.src
                .split('\n')
                .map(l => l.trim().match(/^(attribute|uniform)\s+([a-z][a-z0-9]+)\s+([a-zA-Z0-9_]+);$/))
                .filter(l => l !== null)
            ).reduce((t, a) => [ ...t, ...a ]);
        
        for(let [, modifier, type, name] of matches)
        {
            this._variables[name] = [ modifier, type, this[`get${modifier.capitalize()}Location`](name) ];
        }
        
        const self = this;
        
        return new Proxy(this, {
            get: (c, p) => {
                if(p in self)
                {
                    return self[p];
                }
    
                return self._variables.hasOwnProperty(p)
                    ? self._variables[p][2]
                    : undefined;
            },
            set: (c, p, v) => {
                if(!self._variables.hasOwnProperty(p))
                {
                    return false;
                }
    
                if(p in self)
                {
                    self[p] = v;
                    
                    return true;
                }
    
                let [ modifier, type, location ] = self._variables[p];
                
                self.gl.useProgram(self._program);
                
                switch(modifier)
                {
                    case 'uniform':
                        let t, a;
    
                        if(type.startsWith('mat'))
                        {
                            t = 'Matrix';
                            a = [
                                location,
                                false,
                                v
                            ];
                        }
                        else
                        {
                            t = '';
                            a = [
                                location,
                                v
                            ];
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
            throw new Error(`Expected instance of Shader, got non object`);
        }
        
        if(!(shader instanceof Shader))
        {
            throw new Error(`Expected instance of Shader, got ${shader.constructor.name}`);
        }
        
        this.gl.attachShader(this._program, shader.shader);
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
}
