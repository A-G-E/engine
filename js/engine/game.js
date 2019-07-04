import * as Fyn from '/node_modules/@fyn-software/component/fyn.js';
import { Matrix4, Vector3 } from '../math/exports.js';
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

        const camera = new Ubo(renderer, 'camera', {
            view: Matrix4.lookAt(
                new Vector3(15, 4, 15),
                new Vector3(0, 0, 0),
                new Vector3(0, 1, 0)
            ),
            projection: renderer.projection,
        });

        new Ubo(renderer, 'lighting', {
            position: new Vector3(5.0, 3.0, 5.0),
            color: new Vector3(0.25, 0.25, 0.25),
        });

        renderer.on({ resized: () => camera.projection = renderer.projection });

        this.shadow.appendChild(renderer.canvas);

        fetch('../../monkey.obj')
            .then(r => r.text())
            .then(t => {
                const bones = Array.from(Array(10), i => new Bone(renderer, Math.round(4 + 2 * Math.random())));

                console.log(bones);

                const draw = () => {
                    const r = performance.now() * .00025;
                    const d = 15;

                    camera.view = Matrix4.lookAt(
                        new Vector3(d * Math.cos(r), 14 + (Math.sin(r) * 2), d * Math.sin(r)),
                        new Vector3(0, 0, 0),
                        new Vector3(0, 1, 0)
                    );

                    let m = Matrix4.identity.rotate(22.5 * Math.sin(performance.now() * .0025), new Vector3(1, 0, 0));

                    for(const bone of bones)
                    {
                        bone.world = m;

                        m = m.translate(new Vector3(0, bone.length, 0))
                            .rotate(22.5 * Math.sin(performance.now() * .0025), new Vector3(1, 0, 0));
                    }

                    requestAnimationFrame(draw);
                };
                draw();

                renderer.add(new Grid(renderer));
                bones.forEach(b => renderer.add(b));
                renderer.add(new Obj(renderer, t));
                renderer.play();
            });

    }
}
