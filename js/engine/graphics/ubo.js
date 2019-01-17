const registration = new Map();

export default class Ubo
{
    constructor(name, renderer, conf)
    {
        if(registration.has(name))
        {
            return registration.get(name);
        }

        registration.set(name, this);

        this.gl = renderer.gl;
        this._buffer = renderer.gl.createBuffer();
        this._variables = new Map(Object.entries(conf));

        // Allowcate memory
        this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, this._buffer);
        this.gl.bufferData(this.gl.UNIFORM_BUFFER, this._variables.size * 64, this.gl.DYNAMIC_DRAW);

        let i = 0;
        for(const [k, v] of Object.entries(conf))
        {
            this.gl.bufferSubData(this.gl.UNIFORM_BUFFER, 64 * i, new Float32Array(v.points));
            i++;
        }

        this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, null);
        this.gl.bindBufferBase(this.gl.UNIFORM_BUFFER, 0, this._buffer);

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

                if(self._variables.has(p) === false)
                {
                    throw new Error(`Trying to set unknown property ${p}`);
                }

                self._variables.set(p, v);

                const i = Array.from(self._variables.keys()).findIndex(k => k === p);


                self.gl.bindBuffer(self.gl.UNIFORM_BUFFER, self._buffer);
                self.gl.bufferSubData(self.gl.UNIFORM_BUFFER, 128 * i, new Float32Array(v.points));
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