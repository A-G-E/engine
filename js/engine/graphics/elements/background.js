import Texture from './texture.js';
import Vector2 from '../../../math/vector2.js';

export default class Background extends Texture
{
    constructor(context, key)
    {
        super(context, key);

        this._blinkInterval = null;
    }

    async load()
    {
        const img = await super.load();

        this._srcSize = new Vector2(img.width, img.height);
    }

    render(i)
    {
        this.size = this._renderer.size;

        return super.render(i);
    }

    blink(speed = 300)
    {
        this._blinkInterval = setInterval(() =>
        {
            this.filterMask.z = this.filterMask.z === 1 ? 0 : 1;
        }, speed);
    }
}
