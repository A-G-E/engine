'use strict';

import * as Rasher from '../../rasher.js';
import * as Calculus from '../../math/exports.js';

export default class HUD extends Rasher.Entity
{
    constructor(renderer, key, sections)
    {
        super();

        this.scale = .75;
        this.renderer = renderer;
        this.sprite = new Rasher.Sprite(renderer, key);
        this.sections = sections;
        this.entities = [];
    }

    load()
    {
        return this.sprite.load();
    }

    render(renderer)
    {
        let corners = [];
        for(let i = 0; i < 7; i += 2)
        {
            corners.push(new Calculus.Vector2(...this.sections[i].reduce(
                (t, s) => [ Math.max(t[0], s[0].z), Math.max(t[1], s[0].w) ],
                [0, 0]
            )));
        }

        let scalar = 1 / Math.max(
            1,
            (corners[0].x + corners[1].x) / renderer.width * this.scale,
            (corners[2].x + corners[3].x) / renderer.width * this.scale,
            (corners[0].y + corners[3].y) / renderer.height * this.scale,
            (corners[1].y + corners[2].y) / renderer.height * this.scale
        ) * this.scale;

        corners = corners.map(c => c.multiply(scalar));

        for(let [ i, section ] of Object.entries(this.sections))
        {
            i = Number.parseInt(i);
            section = Object.entries(section);
            section.forEach(s => s[0] = Number.parseInt(s[0]));

            let maxNonStretchable = -1;
            let availableSpace = 0;
            let stretchables = 0;
            let stretchSize = 0;
            let prop = 'x';
            let drawn = 0;

            if(i % 2 === 1)
            {
                prop = i % 4 === 1
                    ? 'x'
                    : 'y';
                let dir = prop === 'x'
                    ? 'width'
                    : 'height';

                availableSpace = renderer[dir] - corners[(i - 1) / 2][prop] - corners[(i + 1) / 2 % 4][prop];

                stretchables = section.filter(([i, e]) =>
                {
                    if(e[1] === false)
                    {
                        let spaceLeft = availableSpace - e[0].zw[prop] * scalar;

                        if(spaceLeft > 0)
                        {
                            availableSpace = spaceLeft;
                            maxNonStretchable = i;
                        }
                    }

                    return e[1];
                }).length;

                stretchSize = availableSpace / Math.max(1, stretchables);
            }

            for(let [ j, [ src, stretch ] ] of section)
            {
                if(i % 2 === 1 && stretch === false && j > maxNonStretchable)
                {
                    continue;
                }

                this.sprite._srcPosition = src.xy;
                this.sprite._srcSize = src.zw;

                src = src.multiply(scalar);

                let posX = 0;
                let posY = 0;

                if(i >= 2 && i <= 4)
                {
                    posX = this.renderer.width - src.z;
                }

                if(i >= 4 && i <= 6)
                {
                    posY = this.renderer.height - src.w;
                }

                switch(i)
                {
                    case 1:
                        posX = corners[0].x + drawn;
                        break;

                    case 3:
                        posY = corners[1].y + drawn;
                        break;

                    case 5:
                        posX = corners[3].x + drawn;
                        break;

                    case 7:
                        posY = corners[0].y + drawn;
                        break;
                }

                this.sprite.position = new Calculus.Vector2(posX, posY);
                this.sprite.size = src.zw;

                if(i % 2 === 1)
                {
                    if(stretch)
                    {
                        this.sprite.size[prop] = stretchSize;
                    }

                    drawn += this.sprite.size[prop];
                }

                this.sprite.render();
            }
        }

        for(let entity of this.entities)
        {
            entity.scalar = scalar;
            entity.render(renderer);
        }
    }

    loop()
    {
    }

    add(entity)
    {
        this.entities.push(entity);

        return entity.load().then(() => entity);
    }
}
