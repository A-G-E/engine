'use strict';

import * as Rasher from '../../rasher.js';
import * as Calculus from '../../math/exports.js';
import Tile from './tile.js';

const RENDER_OFFSET = -1;

function sign(p1, p2, p3)
{
    return (p1.x - p3.x) * (p2.y - p3.y) * (p2.x - p3.x) * (p1.y - p3.y);
}

function pointInVertex(point, vertex)
{
    let b1 = sign(point, vertex[0], vertex[1]) < 0.0;
    let b2 = sign(point, vertex[1], vertex[2]) < 0.0;
    let b3 = sign(point, vertex[2], vertex[0]) < 0.0;

    return b1 === b2 && b2 === b3;
}

export default class Terrain extends Rasher.Entity
{
    constructor(renderer, key, terrain, spriteDimensions, renderCallback = null)
    {
        super();

        this._key = key;
        this._tiles = {};
        this._renderer = renderer;
        this._terrain = terrain;
        this._unit = 64;
        this._camPos = new Calculus.Vector3(0);
        this._renderCallback = renderCallback;
        this.sprite = null;

        this._debug = document.createElement('span');
        this._debug.style.position = 'fixed';
        this._debug.style.top = '.5em';
        this._debug.style.left = '.5em';
        this._debug.style.fontSize = '2em';
        this._debug.style.color = '#eee';
        this._debug.style.zIndex = '1000';

        document.body.appendChild(this._debug);
    }

    load()
    {
        return fetch(Rasher.Resources[this._key])
            .then(r => r.json())
            .then(({ src, tiles }) =>
            {
                let key = `Terrain_${this._key}_sptite`;
                Rasher.Resources[key] = src.file;

                this.sprite = new Rasher.Sprite(this._renderer, key);

                for(let [id, config] of Object.entries(tiles))
                {
                    this._tiles[id] = new Tile(config);
                }

                return this.sprite.load().then(img =>
                {
                    this.sprite.size = new Calculus.Vector2(src.unit * 2);
                    this.sprite._srcSize = new Calculus.Vector2(src.unit);
                });
            });
    }

    render(renderer)
    {
        this._debug.innerHTML = this._camPos.toFixed(2);

        if(this.sprite === null)
        {
            return;
        }

        for(let [z, rows] of Object.entries(this._terrain))
        {
            z = Number.parseInt(z);

            for(let [y, columns] of  Object.entries(rows))
            {
                y = Number.parseInt(y);

                for(let [x, stack] of  Object.entries(columns))
                {
                    x = Number.parseInt(x);

                    for(let tile of stack)
                    {
                        let pos = new Calculus.Vector3(x, y, z);

                        this.sprite.position = new Calculus.Vector2(
                            x + this._camPos.y - y - this._camPos.x + RENDER_OFFSET,
                            .5 * (x - this._camPos.x + y - this._camPos.y + RENDER_OFFSET) - z + this._camPos.z,
                        )
                            .multiply(this._unit)
                            .add(new Calculus.Vector2(renderer.width, renderer.height).multiply(.5));

                        for(let i of this._tiles[tile].stack)
                        {
                            this.sprite._srcPosition = new Calculus.Vector2(i.x, i.y).multiply(this._unit);
                            this.sprite.render();
                        }

                        if(this._renderCallback !== null && pos.equals(this._camPos.floor()))
                        {
                            this.sprite._srcPosition = new Calculus.Vector2(5, 8).multiply(this._unit);
                            this._renderCallback(pos);
                        }

                        this.sprite.filterMask = new Calculus.Vector4(0, 0, 0, 0);
                    }
                }
            }
        }
    }

    loop()
    {
    }

    moveTo(vector3)
    {
        let delta = this._camPos.subtract(vector3);

        if(delta.magnitude > 0)
        {
            let floored = vector3.floor();
            let local = vector3.subtract(floored);
            let tile = this._terrain[floored.z][floored.y][floored.x];
            let zIsQueried = false;
    
            if(tile !== undefined && this._tiles.hasOwnProperty(tile))
            {
                let vertices = this._tiles[tile].vertices;
        
                for(let i = 0; i < vertices.length; i += 3)
                {
                    let a = new Calculus.Vector3(...vertices[i + 0]);
                    let b = new Calculus.Vector3(...vertices[i + 1]);
                    let c = new Calculus.Vector3(...vertices[i + 2]);
            
                    if(pointInVertex(floored, [ a, b, c ]))
                    {
                        let pos = Calculus.Plane.fromPoints(a, b, c).intersectsAt(new Calculus.Line(
                            new Calculus.Vector3(local.x, local.y, 0),
                            new Calculus.Vector3(local.x, local.y, 1)
                        ));
                
                        if([...pos].every(d => !Number.isNaN(d)))
                        {
                            vector3.z = floored.z + pos.z;
                            zIsQueried = true
                        }
                    }
                }
            }
            
            let threshold = .25;
            let deltaZ = Math.abs(this._camPos.z - vector3.z);
            let i = (Math.round(delta.angle) + 360) % 360 / 45;
    
            if([0, 1, 7].includes(i) && (deltaZ > threshold || zIsQueried === false))
            {
                vector3.x = Math.max(Math.floor(this._camPos.x) + .001, vector3.x);
            }
            else if([3, 4, 5].includes(i) && (deltaZ > threshold || zIsQueried === false))
            {
                vector3.x = Math.min(Math.ceil(this._camPos.x) - .001, vector3.x);
            }

            if([1, 2, 3].includes(i) && (deltaZ > threshold || zIsQueried === false))
            {
                vector3.y = Math.max(Math.floor(this._camPos.y) + .001, vector3.y);
            }
            else if([5, 6, 7].includes(i) && (deltaZ > threshold || zIsQueried === false))
            {
                vector3.y = Math.min(Math.ceil(this._camPos.y) - .001, vector3.y);
            }
    
            this._camPos = vector3;
        }
    }
    
    get camera()
    {
        return this._camPos;
    }
    
    set camera(vector3)
    {
        this._camPos = vector3;
    }
}
