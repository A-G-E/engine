'use strict';

import * as Rasher from '../../rasher.js';
import * as Calculus from '../../math/exports.js';

export default class Digimon extends Rasher.Entity
{
    constructor(scene, key, srcVec4, space, pos, speed, xBias)
    {
        super();
        
        this.srcVec4 = srcVec4;
        this.space = space;
        this.pos = pos;
        this.xBias = xBias;
        this.speed = speed;
        this.origSize = null;
        this.origPos = null;
        this.frame = Math.floor(Math.random() * 3);
        this.positions = [ this.srcVec4.x, 0 ];
        this.sprite = new Rasher.Sprite(scene.renderer, key);
    }
    
    load()
    {
        return this.sprite.load().then(img => {
            this.sprite._srcPosition = new Calculus.Vector2(this.srcVec4.x, this.srcVec4.y);
            this.sprite._srcSize = new Calculus.Vector2(this.srcVec4.z, this.srcVec4.w);
            
            this.origSize = this.sprite._srcSize;
            this.origPos = this.sprite._srcPosition.x;
            
            let frameBlender = () => Rasher.Animation.ease(f =>
            {
                // console.log([ 1 - f, f ]);
                //
                // monster.alphas = [ 1 - f, f ];
            }, {
                duration: this.speed,
                easing: 'linear',
            }).then(() =>
            {
                this.positions[0] = this.position;
                this.frame = ++this.frame % 4;
                this.positions[1] = this.position;
        
                frameBlender();
            });
    
            frameBlender();
        })
    }
    
    get position()
    {
        return (this.origPos || 0) + Math.abs(((this.frame + 2) % 4) - 2) * (this.sprite._srcSize.x + this.space);
    }
    
    render(renderer)
    {
        if(this.origSize !== null)
        {
            this.sprite.size = this.origSize.multiply(renderer.width / 700);
            this.sprite.position = new Calculus.Vector2(
                renderer.width / 7 * (this.pos + 1) + 40 * (this.pos - 2) + this.xBias,
                renderer.height * 4 / 5 - this.sprite.size.y
            );
        }
        
        this.sprite._srcPosition.x = this.positions[0];
        this.sprite.render();
    }
    
    loop()
    {
    
    }
    
    spawn(resolveAt = null)
    {
        return Rasher.Animation.ease(f =>
        {
            this.sprite.filterMask = new Calculus.Vector4(1 - f, 1 - f, 1 - f, 0);
        }, {
            duration: Math.random() * 1500 + 1000,
            easing: 'easeOutCubic',
            returnAt: resolveAt,
        });
    }
}