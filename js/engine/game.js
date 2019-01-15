'use strict';

import * as Fyn from 'http://fyn-software.cpb/component/fyn.js';
import { Matrix4, Vector3 } from '../math/exports.js';
import Renderer from './graphics/renderer.js';
import Ubo from './graphics/ubo.js';
import Grid from './graphics/elements/grid.js';
import Bone from './graphics/elements/bone.js';

export default class Game extends Fyn.Component
{
    ready()
    {
        const renderer = new Renderer(this);
        const camera = new Ubo('camera', renderer);
        camera.view = Matrix4.lookAt(
            new Vector3(5, 4, 5),
            new Vector3(0, 0, 0),
            new Vector3(0, 1, 0)
        );
        camera.projection = renderer.projection;

        this.shadow.appendChild(renderer.canvas);

        renderer.add(new Grid(renderer));
        renderer.add(new Bone(renderer));
        renderer.play();
    }
}
