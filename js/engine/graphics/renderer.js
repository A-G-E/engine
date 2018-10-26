'use strict';

import RenderElement from './renderElement.js';
import * as Calculus from '../../math/exports.js';

export default class Renderer
{
    constructor(owner)
    {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = 0;
    
        const context = canvas.getContext('webgl');
        context.clearColor(0.75, 0.85, 0.8, 1);
        context.enable(context.DEPTH_TEST);
        context.enable(context.CULL_FACE);
        context.frontFace(context.CCW);
        context.cullFace(context.BACK);
    
        this._owner = owner;
        this._canvas = canvas;
        this._context = context;
        this._program = null;
        this._playState = Renderer.stopped;
        this._stack = [];
    }

    play()
    {
        this._playState = Renderer.playing;
        this._canvas.style.zIndex = 100;
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
        this.resize();
        this.clear();

        for(let item of this._stack)
        {
            item.render(this);
        }

        if(this._playState === Renderer.playing)
        {
            window.requestAnimationFrame(() => this.loop());
        }
    }

    clear()
    {
        this._context.clear(this._context.COLOR_BUFFER_BIT | this._context.DEPTH_BUFFER_BIT);
    }

    resize()
    {
        if(
            this._canvas.width !== this._owner.clientWidth ||
            this._canvas.height !== this._owner.clientHeight
        ){
            this._canvas.width = this._owner.clientWidth;
            this._canvas.height = this._owner.clientHeight;

            this._context.viewport(0, 0, this._canvas.width, this._canvas.height);
        }
    }

    add(element)
    {
        // if(!element instanceof RenderElement)
        // {
        //     throw new Error('Renderer.add expected an RenderElement, got something else');
        // }
        
        this._stack.push(element);
    }

    get canvas()
    {
        return this._canvas;
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
