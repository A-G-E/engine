export default class Fbo
{
    #context;
    #renderer;
    #buffer;
    #types;

    constructor(renderer)
    {
        this.#context = renderer.context;
        this.#renderer = renderer;
        this.#buffer = this.#context.createFramebuffer();
        this.#types = {
            color: {
                texture: this.#context.createTexture(),
                index: 0,
                component: this.#context.RGBA8,
                attachment: this.#context.COLOR_ATTACHMENT0,
            },
            depth: {
                texture: this.#context.createTexture(),
                index: 1,
                component: this.#context.DEPTH_COMPONENT16,
                attachment: this.#context.DEPTH_ATTACHMENT,
            },
        };

        this.#renderer.on({
            resized: () => Object.keys(this.#types).forEach(k => this.buffer(k)),
        });

        Object.keys(this.#types).forEach(k => this.buffer(k));
    }

    record(callback)
    {
        this.#context.bindFramebuffer(this.#context.FRAMEBUFFER, this.#buffer);

        this.#context.clear(this.#context.COLOR_BUFFER_BIT | this.#context.DEPTH_BUFFER_BIT);

        callback();

        this.#context.bindFramebuffer(this.#context.FRAMEBUFFER, null);
    }

    buffer(name, bind = true)
    {
        if(Object.keys(this.#types).includes(name) !== true)
        {
            throw new Error(`Can't buffer an unknown type (${name})`);
        }

        const { index, component, attachment } = this.#types[name];
        const { width, height } = this.#renderer;
        const texture = this.#context.createTexture();

        if(bind === true)
        {
            this.#context.bindFramebuffer(this.#context.FRAMEBUFFER, this.#buffer);
        }
        this.#context.activeTexture(this.#context[`TEXTURE${index}`]);

        this.#context.bindTexture(this.#context.TEXTURE_2D, texture);
        this.#context.pixelStorei(this.#context.UNPACK_FLIP_Y_WEBGL, false);
        this.#context.texParameteri(this.#context.TEXTURE_2D, this.#context.TEXTURE_MAG_FILTER, this.#context.NEAREST);
        this.#context.texParameteri(this.#context.TEXTURE_2D, this.#context.TEXTURE_MIN_FILTER, this.#context.NEAREST);
        this.#context.texParameteri(this.#context.TEXTURE_2D, this.#context.TEXTURE_WRAP_S, this.#context.CLAMP_TO_EDGE);
        this.#context.texParameteri(this.#context.TEXTURE_2D, this.#context.TEXTURE_WRAP_T, this.#context.CLAMP_TO_EDGE);
        this.#context.texStorage2D(this.#context.TEXTURE_2D, 1, component, width, height);
        this.#context.framebufferTexture2D(this.#context.FRAMEBUFFER, attachment, this.#context.TEXTURE_2D, texture, 0);

        if(bind === true)
        {
            this.#context.bindFramebuffer(this.#context.FRAMEBUFFER, null);
        }

        this.#types[name].texture = texture;
    }
}