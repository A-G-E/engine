'use strict';

import * as Fyn from 'http://fyn-software.cpb/component/fyn.js';
import { Matrix4, Vector3, Vector2 } from '../math/exports.js';
import Renderer from './graphics/renderer.js';
import Obj from './graphics/obj.js';
import Ubo from './graphics/ubo.js';
import Grid from './graphics/elements/grid.js';
import Bone from './graphics/elements/bone.js';

export default class Game extends Fyn.Component
{
    ready()
    {
        const renderer = new Renderer(this);
        const camera = new Ubo('camera', renderer, {
            view: Matrix4.lookAt(
                new Vector3(5, 4, 5),
                new Vector3(0, 0, 0),
                new Vector3(0, 1, 0)
            ),
            projection: renderer.projection,
        });

        const light = new Ubo('light', renderer, {
            lightDirection: new Vector3(.3, -1, .5),
            lightColour: new Vector3(1, .8, .8),
            lightBias: new Vector2(.3, .8),
        });

        renderer.on({ resized: () => camera.projection = renderer.projection });

        const draw = () => {
            const r = performance.now() * .00025;
            const d = 5;

            camera.view = Matrix4.lookAt(
                new Vector3(d * Math.cos(r), 4 + (Math.sin(r) * 2), d * Math.sin(r)),
                new Vector3(0, 0, 0),
                new Vector3(0, 1, 0)
            );

            requestAnimationFrame(draw);
        };
        draw();

        this.shadow.appendChild(renderer.canvas);

        // fetch('../../bone.obj')
        fetch('../../monkey.obj')
            .then(r => r.text())
            .then(t => {
                renderer.add(new Grid(renderer));
                // renderer.add(new Bone(renderer));
                renderer.add(new Obj(renderer, t));
                renderer.play();
            });

    }
}
