import { Matrix4 } from '../../math/exports.js';
import * as Calculus from '../../math/exports.js';

const FOV = 90 * Math.PI / 180;
const clip = {
    near: 0.1,
    far: 1000.0,
};

export default class Renderer extends EventTarget
{
    constructor(owner)
    {
        super();

        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = 0;

        const context = canvas.getContext('webgl2');
        context.clearColor(.2, .2, .2, 1);
        context.enable(context.DEPTH_TEST);
        context.enable(context.CULL_FACE);
        context.frontFace(context.CCW);
        context.cullFace(context.BACK);
        context.depthFunc(context.LEQUAL);
        context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);

        this._owner = owner;
        this._canvas = canvas;
        this._context = context;
        this._program = null;
        this._playState = Renderer.stopped;
        this._stack = [];
        this._projection = Matrix4.perspective(FOV, 1, clip.near, clip.far);

        const observer = new ResizeObserver(([ e ]) =>
        {
            const old = { w: this._canvas.width, h: this._canvas.height };
            const w = e.contentRect.width;
            const h = e.contentRect.height;

            this._canvas.width = w;
            this._canvas.height = h;

            this._context.viewport(0, 0, w, h);
            this._projection = Matrix4.perspective(FOV, w / h, clip.near, clip.far);

            this.emit('resized', { old, new: { w: this._canvas.width, h: this._canvas.height } });
        });

        observer.observe(this._owner);
    }

    play()
    {
        this._playState = Renderer.playing;
        this.loop();
    }

    pause()
    {
        this._playState = Renderer.paused;
    }

    stop()
    {
        this._playState = Renderer.stopped;
        this._canvas.style.zIndex = 1;
    }

    loop()
    {
        this.clear();

        for(let item of this._stack)
        {
            item.render(this);
        }

        if(this._playState === Renderer.playing)
        {
            // setTimeout(()=>this.loop(), 1000);
            window.requestAnimationFrame(() => this.loop());
        }
    }

    clear()
    {
        this._context.clear(this._context.COLOR_BUFFER_BIT | this._context.DEPTH_BUFFER_BIT);
    }

    add(element)
    {
        // If(!element instanceof RenderElement)
        // {
        //     Throw new Error('Renderer.add expected an RenderElement, got something else');
        // }

        this._stack.push(new element(this));
    }

    get canvas()
    {
        return this._canvas;
    }

    get projection()
    {
        return this._projection;
    }

    get width()
    {
        return this._canvas.width;
    }

    get height()
    {
        return this._canvas.height;
    }

    get size()
    {
        return new Calculus.Vector2(this.width, this.height);
    }

    get gl()
    {
        return this._context;
    }

    get program()
    {
        return this._program;
    }

    set program(p)
    {
        this._program = p;

        this._context.useProgram(p.program);
    }

    static get playing()
    {
        return 'playing';
    }

    static get paused()
    {
        return 'paused';
    }

    static get stopped()
    {
        return 'stopped';
    }
}
