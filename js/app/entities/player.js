'use strict';

import * as Rasher from '../../rasher.js';
import * as Calculus from '../../math/exports.js';

export default class Player extends Rasher.Entity
{
    constructor(renderer, key)
    {
        super();

        this.size = 50;
        this._movement = new Calculus.Vector2(0);
        this._animationState = new Calculus.Vector4(0, 0, 0, 0);
        this._animationLoop = null;
        this._position = new Calculus.Vector3(4.5, 8.5, 1);
        this.renderer = renderer;
        this.frame = Math.floor(Math.random() * 2);
        this.sprite = new Rasher.Sprite(renderer, key);
    }

    load()
    {
        return this.sprite.load().then(img =>
        {
            this.sprite.size = new Calculus.Vector2(this.size, this.size * 2);
            this.sprite._srcSize = new Calculus.Vector2(19, 38);

            let frameBlender = () => Rasher.Animation.ease(f =>
            {
                // console.log([ 1 - f, f ]);
                //
                // monster.alphas = [ 1 - f, f ];
            }, {
                duration: 300,
                easing: 'linear',
            }).then(() =>
            {
                // this.sprite._srcPosition.x = (this.frame + 1) * this.sprite._srcSize.x;
                this.frame = ++this.frame % 2;

                frameBlender();
            });

            frameBlender();
        });
    }

    render(renderer)
    {
        this.sprite.position = renderer.size.subtract(this.sprite.size).multiply(.5);
    }

    draw(renderer)
    {
        let size = this.sprite.size.clone;
        let position = this.sprite.position.clone;

        if(this._movement.magnitude > 0)
        {
            switch(this._movement.snapped)
            {
                case 0:
                case 180:
                case -180:
                    this._animationState.y = 2;
                    break;

                case -45:
                case -135:
                    this._animationState.y = 1;
                    break;

                case 45:
                case 135:
                    this._animationState.y = 3;
                    break;

                case 90:
                    this._animationState.y = 4;
                    break;

                case -90:
                    this._animationState.y = 0;
            }

            this._animationState.z = this._movement.angle > 90 || this._movement.angle < -90;

            if(this._animationLoop === null)
            {
                this._animationLoop = setInterval(() => {
                    this._animationState.x = this.frame + 1;
                    this.frame = ++this.frame % 2;
                }, 150);
            }
        }
        else
        {
            this._animationState.x = 0;

            if(this._animationLoop !== null)
            {
                clearInterval(this._animationLoop);
                this._animationLoop = null;
            }
        }

        if(this._animationState.z === true)
        {
            this.sprite.position.x += this.size;
            this.sprite.size.x *= -1;
        }

        this.sprite._srcPosition.x = this._animationState.x * this.sprite._srcSize.x + this._animationState.x + 1;
        this.sprite._srcPosition.y = this._animationState.y * this.sprite._srcSize.y;

        this.sprite.render();

        this.sprite.size = size;
        this.sprite.position = position;
    }

    loop()
    {
    }

    set movement(movement)
    {
        this._movement = movement;
    }

    get position()
    {
        return this._position;
    }
}
