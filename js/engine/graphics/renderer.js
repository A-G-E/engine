import Quad from './elements/quad.js';
import Fbo from './fbo.js';
import Renderable from './renderable.js';
import { Matrix4, Vector2 } from '../../math/exports.js';

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
        this._frameBuffer = new Fbo(this);
        this._quad = new Quad(this);

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
        this._frameBuffer.record(() => {
            for(let item of this._stack)
            {
                item.preRender(this);
                item.render(this);
                item.postRender(this);
            }
        });

        this._quad.preRender(this);
        this._quad.render(this);

        if(this._playState === Renderer.playing)
        {
            window.requestAnimationFrame(() => this.loop());
        }
    }

    add(element)
    {
        if(!element instanceof Renderable)
        {
            throw new Error('Renderer.add expected an Renderable, got something else');
        }

        this._stack.push(element);
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
        return new Vector2(this.width, this.height);
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
