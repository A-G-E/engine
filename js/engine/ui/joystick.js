'use strict';

import Sprite from '../graphics/elements/sprite.js';
import Animation from '../graphics/animation.js';
import * as Calculus from '../../math/exports.js';

export default class Joystick
{
    constructor(renderer, key)
    {
        this.renderer = renderer;
        this.sprite = new Sprite(renderer, key);

        this.pointerid = null;
        this.startPoint = null;
        this.delta = new Calculus.Vector2(0);

        if(window.mobile === true)
        {
            window.addEventListener('pointerdown', e => {
                if(
                    this.pointerid === null &&
                    e.x >= this.sprite.position.x &&
                    e.x <= this.sprite.position.x + this.sprite.size.x &&
                    e.y >= this.sprite.position.y &&
                    e.y <= this.sprite.position.y + this.sprite.size.y
                ){
                    this.pointerid = e.pointerId;
                    this.startPoint = new Calculus.Vector2(e.x, e.y);
                }
            });
            window.addEventListener('pointermove', e => {
                if(e.pointerId === this.pointerid)
                {
                    this.delta = new Calculus.Vector2(this.startPoint.x - e.x, this.startPoint.y - e.y).multiply(-1);
                }
            });
            window.addEventListener('pointerup', e => {
                if(e.pointerId === this.pointerid)
                {
                    this.pointerid = null;
        
                    let delta = this.delta.clone;
        
                    Animation.ease(f => this.delta = delta.multiply(1 - f), {
                            duration: 100,
                            easing: 'easeOut'
                        })
                        .then(() => this.delta = new Calculus.Vector2(0));
                }
            });
        }
    }

    load()
    {
        return this.sprite.load().then(img =>
        {
            this.sprite.size = new Calculus.Vector2(128);
            this.sprite._srcSize = new Calculus.Vector2(512);
        });
    }

    render(renderer)
    {
        if(window.mobile !== true)
        {
            return;
        }
    
        this.sprite.position = new Calculus.Vector2(24, this.renderer.height - 152);
        this.sprite._srcPosition.x = 0;
        this.sprite.render();

        let origin = this.sprite.position.clone;

        this.sprite.position = this.sprite.position.add(this.delta.max(48));
        this.sprite._srcPosition.x = 512;
        this.sprite.render();

        this.sprite.position = origin;
    }

    loop()
    {
    }

    get movement()
    {
        return this.delta;
    }
}
