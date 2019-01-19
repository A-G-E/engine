const registration = new Map();
const sizes = new Map([
    [ 'Matrix4', 64 ],
    [ 'Vector4', 16 ],
    [ 'Vector3', 16 ],
    [ 'Vector2', 8 ],
]);

let bindIndex = 0;

export default class Ubo
{
    static get(name)
    {
        return registration.get(name);
    }

    constructor(renderer, name, conf)
    {
        if(registration.has(name))
        {
            return registration.get(name);
        }

        registration.set(name, this);

        this.gl = renderer.gl;
        this._name = name;
        this._index = bindIndex;
        this._buffer = renderer.gl.createBuffer();
        this._variables = new Map(Object.entries(conf));
        this._sizes = Array.from(this._variables.values(), v => sizes.get(v.constructor.name));

        bindIndex++;

        // Allowcate memory
        this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, this._buffer);
        this.gl.bufferData(this.gl.UNIFORM_BUFFER, this._sizes.sum, this.gl.DYNAMIC_DRAW);
        this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, null);

        for(const [k, v] of Object.entries(conf))
        {
            this.set(k, v);
        }

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
                }
                else
                {
                    self.set(p, v);
                }

                return true;
            },
            has: (c, p) => self._variables.hasOwnProperty(p),
        });
    }

    set(key, value)
    {
        if(this._variables.has(key) === false)
        {
            throw new Error(`Trying to set unknown property ${key}`);
        }

        this._variables.set(key, value);

        const i = Array.from(this._variables.keys()).findIndex(k => k === key);

        this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, this._buffer);
        this.gl.bufferSubData(this.gl.UNIFORM_BUFFER, this._sizes.slice(0, i).sum, new Float32Array(value.points));
        this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, null);
        this.gl.bindBufferBase(this.gl.UNIFORM_BUFFER, this._index, this._buffer);
    }

    get index()
    {
        return this._index;
    }
}