import * as Types from '/node_modules/@fyn-software/data/types.js';
import { Vector2 } from '/js/math/exports.js';
import Matrix4 from '/js/math/matrix4.js';
import Fbo from '/js/engine/graphics/fbo.js';
import Quad from '/js/engine/graphics/elements/quad.js';
import Renderable from '/js/engine/graphics/renderable.js';

const FOV = 90 * Math.PI / 180;
const clip = {
    near: 0.1,
    far: 1000.0,
};
export const State = Types.Enum.define({
    playing: { label: 'playing' },
    paused: { label: 'paused' },
    stopped: { label: 'stopped' },
});

export default class Renderer extends EventTarget
{
    #owner;
    #canvas;
    #context;
    #projection = Matrix4.perspective(FOV, 1, clip.near, clip.far);
    #state = State.stopped;
    #stack = [];
    #program = null;
    #frameBuffer;
    #quad;

    constructor(owner, canvas)
    {
        super();

        this.#context = canvas.getContext('webgl2');
        this.#context.clearColor(.2, .2, .2, 1);
        this.#context.enable(this.#context.DEPTH_TEST);
        this.#context.enable(this.#context.CULL_FACE);
        this.#context.frontFace(this.#context.CCW);
        this.#context.cullFace(this.#context.BACK);
        this.#context.depthFunc(this.#context.LEQUAL);
        this.#context.blendFunc(this.#context.SRC_ALPHA, this.#context.ONE_MINUS_SRC_ALPHA);


        this.#owner = owner;
        this.#canvas = canvas;
        this.#frameBuffer = new Fbo(this);
        this.#quad = new Quad(this.#context);
    }

    resize(w, h)
    {
        const old = { w: this.#canvas.width, h: this.#canvas.height };

        this.#context.viewport(0, 0, w, h);
        this.#projection = Matrix4.perspective(FOV, w / h, clip.near, clip.far);

        this.#canvas.width = w;
        this.#canvas.height = h;

        this.emit('resized', { old, new: { w: this.#canvas.width, h: this.#canvas.height } });
    }

    loop()
    {
        this.#frameBuffer.record(() => {
            for(const item of this.#stack)
            {
                item.preRender(this);
                item.render(this);
                item.postRender(this);
            }
        });

        this.#quad.preRender(this);
        this.#quad.render(this);

        this.#context.commit();

        if(this.#state === State.playing)
        {
            requestAnimationFrame(() => this.loop());
        }
    }

    play()
    {
        this.#state = State.playing;

        this.loop();
    }

    pause()
    {
        this.#state = State.paused;
    }

    async stop()
    {
        this.#state = State.stopped;
        this.#canvas.style.zIndex = 1;
    }

    add(element)
    {
        if((element instanceof Renderable) == false)
        {
            throw new Error('Renderer.add expected an Renderable, got something else');
        }

        this.#stack.push(element);
    }

    get canvas()
    {
        return this.#canvas;
    }

    get width()
    {
        return this.#canvas.width;
    }

    get height()
    {
        return this.#canvas.height;
    }

    get size()
    {
        return new Vector2(this.width, this.height);
    }

    get context()
    {
        return this.#context;
    }

    get projection()
    {
        return this.#projection;
    }

    get program()
    {
        return this.#program;
    }

    set program(p)
    {
        this.#program = p;
        this.#context.useProgram(p.program);
    }
}
