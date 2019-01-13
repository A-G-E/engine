'use strict';

import * as Fyn from 'http://fyn-software.cpb/component/fyn.js';
import Renderer from './graphics/renderer.js';
import Grid from './graphics/elements/grid.js';
import Bone from './graphics/elements/bone.js';
import Line from './graphics/elements/line.js';

export default class Game extends Fyn.Component
{
    ready()
    {
        const renderer = new Renderer(this);

        this.shadow.appendChild(renderer.canvas);

        // renderer.add(Grid);
        // renderer.add(Bone);
        renderer.add(Line);
        renderer.play();
    }
}
