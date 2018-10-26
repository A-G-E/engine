'use strict';

import Renderer from './renderer.js';
import Buffer from './buffer.js';
import * as Calculus from '../../math/exports.js';

export default class RenderElement
{
    constructor(renderer, position, size)
    {
        if(!renderer instanceof Renderer)
        {
            throw new Error('argument "renderer" is not an instance of the Renderer class');
        }

        if(!position instanceof Calculus.Vector2)
        {
            throw new Error('argument "position" is not an instance of the Vector2 class');
        }

        if(!size instanceof Calculus.Vector2)
        {
            throw new Error('argument "size" is not an instance of the Vector2 class');
        }

        this.gl = renderer.gl;
        this._renderer = renderer;
        this._position = position;
        this._size = size;

        this._positionBuffer = new Buffer(renderer, 'position');
        this._positionBuffer.data = [
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
        ];
    }

    render()
    {

    }

    get width()
    {
        return this._size.x;
    }

    get height()
    {
        return this._size.y;
    }

    get position()
    {
        if(this._position instanceof Calculus.Vector4)
        {
            return new Calculus.Vector2(
                this._position.x + this._position.z * this._renderer.width,
                this._position.y + this._position.w * this._renderer.height
            );
        }
        
        return this._position;
    }

    set position(position)
    {
        this._position = position;
    }

    get size()
    {
        return this._size;
    }

    set size(size)
    {
        this._size = size;
    }
    
    set scalar(val)
    {
        this._scalar = val;
    }

    get info()
    {
        return {
            x: this.position.x,
            y: this.position.y,
            width: this._size.x,
            height: this._size.y,
        };
    }
}