import * as Comlink from 'https://unpkg.com/comlink/dist/esm/comlink.mjs';
import { Matrix4, Vector3 } from '../math/exports.js';
import Renderer from './graphics/renderer.js';
import Obj from './graphics/obj.js';
import Ubo from './graphics/ubo.js';
import Grid from './graphics/elements/grid.js';
import Bone from './graphics/elements/bone.js';

export default class Game extends EventTarget
{
    #renderer;
    #camera;

    constructor(canvas)
    {
        super();

        this.#renderer = new Renderer(this, canvas);
        this.#camera = new Ubo(this.#renderer.context, 'camera', {
            view: Matrix4.lookAt(
                new Vector3(15, 4, 15),
                new Vector3(0, 0, 0),
                new Vector3(0, 1, 0)
            ),
            projection: this.#renderer.projection,
        });

        this.ready();
    }

    async ready()
    {
        new Ubo(this.#renderer.context, 'lighting', {
            position: new Vector3(5.0, 3.0, 5.0),
            color: new Vector3(0.25, 0.25, 0.25),
        });

        this.#renderer.on({
            resized: () => this.#camera.projection = this.#renderer.projection,
        });

        const t = await fetch('../../monkey.obj').then(r => r.text());

        const bones = Array.from(Array(10), i => new Bone(this.#renderer.context, Math.round(3 + 2 * Math.random())));

        const draw = () => {
            const r = performance.now() * .00025;
            const d = 15;

            this.#camera.view = Matrix4.lookAt(
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

        this.#renderer.add(new Grid(this.#renderer.context));
        bones.forEach(b => this.#renderer.add(b));
        this.#renderer.add(new Obj(this.#renderer.context, t));
        this.#renderer.play();
    }

    resize(w, h)
    {
        this.#renderer.resize(w, h);
    }
}

Comlink.expose(Game);
