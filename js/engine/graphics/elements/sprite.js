import Texture from './texture.js';

export default class Sprite extends Texture
{
    constructor(renderer, key)
    {
        super(renderer, key);
    }

    render(renderer)
    {
        let pos = this.position;
        let size = this.size;

        this.position = this.position.multiply(this._scalar);
        this.size = this.size.multiply(this._scalar);

        super.render(renderer);

        this.position = pos;
        this.size = size;
    }
}
