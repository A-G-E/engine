'use struct';

export default class Input
{
    constructor(conf)
    {
        this.conf = Object.entries(conf);
        this.listners = {};
        
        window.addEventListener('keydown', e => {
            for(let event of this.conf.filter(c => c[1].includes(e.keyCode)).map(c => c[0]))
            {
                this.fire(event, true);
            }
        });
        
        window.addEventListener('keyup', e => {
            for(let event of this.conf.filter(c => c[1].includes(e.keyCode)).map(c => c[0]))
            {
                this.fire(event, false);
            }
        });
    }
    
    listen(conf)
    {
        for(let [e, c] of Object.entries(conf))
        {
            if(!this.listners.hasOwnProperty(e))
            {
                this.listners[e] = [];
            }
            
            this.listners[e].push({
                callback: c,
                state: false,
            });
        }
    }
    
    fire(event, state)
    {
        for(let l of this.listners[event] || [])
        {
            if(l.state !== state)
            {
                l.state = state;
                l.callback(state);
            }
        }
    }
}