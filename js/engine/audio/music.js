'use strict';

import Sound from './sound.js';

export default class Music extends Sound
{
    constructor(key)
    {
        super(key, 'music', .25);
    
        this.audio.loop = true;
    }
}
