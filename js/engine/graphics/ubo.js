const registration = new Map();

export default class Ubo
{
    constructor(name, renderer)
    {
        if(registration.has(name))
        {
            return registration.get(name);
        }

        registration.set(name, this);

        this.gl = renderer.gl;
        this._buffer = renderer.gl.createBuffer();
        this._variables = new Map();

        const self = this;

        return new Proxy(this, {
            get: (c, p) => {
                if(p in self)
                {
                    return self[p];
                }

                return self._variables.get(p);
            },
            set: (c, p, v) => {
                if(p in self)
                {
                    self[p] = v;

                    return true;
                }

                self._variables.set(p, v);

                const i = Array.from(self._variables.keys()).findIndex(k => k === p);


                self.gl.bindBuffer(self.gl.UNIFORM_BUFFER, self._buffer);
                self.gl.bufferSubData(self.gl.UNIFORM_BUFFER, 128 * i, new Float32Array(v));
                self.gl.bindBuffer(self.gl.UNIFORM_BUFFER, null);

                return true;
            },
            has: (c, p) => self._variables.hasOwnProperty(p),
        });
    }

    static get(name)
    {
        return registration.get(name);
    }
}