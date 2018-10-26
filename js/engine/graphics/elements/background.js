'use strict';

import Texture from './texture.js';
import Vector2 from '../../../math/vector2.js';

export default class Background extends Texture
{
    constructor(renderer, key)
    {
        super(renderer, key);
        
        this._blinkInterval = null;
    }

    load()
    {
        return super.load().then(img => {
            this._srcSize = new Vector2(img.width, img.height);
        });
    }

    render(i)
    {
        this.size = this._renderer.size;

        return super.render(i);
    }
    
    blink(speed = 300)
    {
        this._blinkInterval = setInterval(() => {
            this.filterMask.z = this.filterMask.z === 1 ? 0 : 1;
        }, speed);
    }
}
