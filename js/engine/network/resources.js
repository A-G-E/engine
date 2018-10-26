'use strict';

class Resources
{
    constructor()
    {
       this.registration = {};
    }

    preload(key)
    {
        this.load(key);
    }

    load(key)
    {
        return fetch(localInstance.registration[key].url, {
            credentials: 'same-origin'
        })
            .then(r => r.blob())
            .then(r => {
                localInstance.registration[key].value = window.URL.createObjectURL(r);

                return r;
            });
    }

    *[Symbol.iterator]()
    {
        yield * Object.keys(localInstance.registration);
    }
}

const localInstance = new Resources();
const resources = new Proxy(Resources, {
    get: (c, key) =>
    {
        if(key in resources)
        {
            return localInstance.registration[key].url;
        }
        else if(localInstance.__proto__.hasOwnProperty(key))
        {
            return localInstance[key];
        }

        throw new Error(`${key} is not a registered resource`);
    },

    set: (c, key, val) =>
    {
        if(key in resources)
        {
            throw new Error('a resource with that name is already registered');
        }

        localInstance.registration[key] = {
            url: val,
            value: null,
        };
        localInstance.preload(key);

        return true;
    },

    deleteProperty: (c, key) =>
    {
        if(key in resources)
        {
            delete localInstance.registration[key];

            return true;
        }

        throw new Error(`${key} is not a registered resource`);
    },

    construct: (c, [key, conf]) =>
    {
        if(typeof conf === 'string')
        {
            conf = { url: conf };
        }

        localInstance.registration[key] = Object.assign({
            url: '',
            value: null,
        }, conf);

        return localInstance.load(key);
    },

    has: (c, key) =>
    {
        return localInstance.registration.hasOwnProperty(key);
    },

    apply: (c, t, args) =>
    {
        return localInstance.load(args[0] || '');
    }
});

export default resources;
