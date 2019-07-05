import * as Rasher from '../../rasher.js';

export default class Tile extends Rasher.Entity
{
    constructor(config)
    {
        super();

        this.config = config;
    }

    load()
    {

    }

    render(renderer, terrain)
    {
    }

    loop()
    {
    }

    get stack()
    {
        return this.config.sprites;
    }

    get vertices()
    {
        return this.config.vertices || [];
    }
}
