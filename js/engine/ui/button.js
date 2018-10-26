'use strict';

import Sprite from '../graphics/elements/sprite.js';
import * as Calculus from '../../math/exports.js';

export default class Button extends Sprite
{
    constructor(renderer, key)
    {
        super(renderer, key);
    
        this.pointerid = null;
        
        window.addEventListener('pointerdown', e => {
            // NOTE(Chris Kruining)
            // I needed to reverse-scale
            // the input x-y to get proper
            // position checking
            let target = new Calculus.Vector2(e.x, e.y).multiply(1 / this._scalar);
            let pos = new Calculus.Rectangle(...this.position, ...this.size);
            
            if(this.pointerid === null && pos.includes(target))
            {
                this.pointerid = e.pointerId;
                
                this.filterMask.x = 1;
                this.filterMask.z = 1;
            }
        });
        window.addEventListener('pointerup', e => {
            if(e.pointerId === this.pointerid)
            {
                this.pointerid = null;
    
                this.filterMask.x = 0;
                this.filterMask.z = 0;
            }
        });
    }
}