'use strict';

import Resources from '../network/resources.js';
import Config from '../config.js';

export default class Sound
{
    constructor(key, type, volume = 1)
    {
        new Config('volumes', {
            master: .001,
            music: 1,
            effect: 1,
        });
        
        this.audio = new Audio();
        this.audio.src = Resources[key];
        this.audio.autoplay = false;
        this.audio.loop = false;
        this.audio.volume = Config.volumes.master * Config.volumes[type] * volume;
        this.playing = false;
    }
    
    play()
    {
        this.audio.play();
        this.playing = true;
    }
    
    pause()
    {
        this.audio.pause();
        this.playing = false;
    }
    
    stop()
    {
        this.audio.pause();
        this.audio.currentTime = 0;
        
        this.playing = false;
    }
    
    toggle()
    {
        if(this.playing)
        {
            this.pause();
        }
        else
        {
            this.play();
        }
    }
}
