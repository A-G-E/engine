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
    #context;
    #buffer;
    #name;
    #index;
    #variables;
    #sizes;

    static get(name)
    {
        return registration.get(name);
    }

    constructor(context, name, conf)
    {
        if(registration.has(name))
        {
            return registration.get(name);
        }

        registration.set(name, this);

        this.#context = context;
        this.#buffer = context.createBuffer();

        this.#name = name;
        this.#index = bindIndex;
        this.#variables = new Map(Object.entries(conf));
        this.#sizes = Array.from(this.#variables.values(), v => sizes.get(v.constructor.name));

        // Allowcate memory
        this.#context.bindBuffer(this.#context.UNIFORM_BUFFER, this.#buffer);
        this.#context.bufferData(this.#context.UNIFORM_BUFFER, this.#sizes.sum, this.#context.DYNAMIC_DRAW);
        this.#context.bindBuffer(this.#context.UNIFORM_BUFFER, null);

        bindIndex++;

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

                return self.#variables.get(p);
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
            has: (c, p) => self.#variables.hasOwnProperty(p),
        });
    }

    set(key, value)
    {
        if(this.#variables.has(key) === false)
        {
            throw new Error(`Trying to set unknown property ${key}`);
        }

        this.#variables.set(key, value);

        const i = Array.from(this.#variables.keys()).findIndex(k => k === key);

        this.#context.bindBuffer(this.#context.UNIFORM_BUFFER, this.#buffer);
        this.#context.bufferSubData(this.#context.UNIFORM_BUFFER, this.#sizes.slice(0, i).sum, new Float32Array(value.points));
        this.#context.bindBuffer(this.#context.UNIFORM_BUFFER, null);
        this.#context.bindBufferBase(this.#context.UNIFORM_BUFFER, this.#index, this.#buffer);
    }

    get index()
    {
        return this.#index;
    }
}