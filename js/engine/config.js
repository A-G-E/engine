'use strict';

import Database from './storage/database.js';

class Config
{
    constructor()
    {
        this.registration = {};
    }

    *[Symbol.iterator]()
    {
        yield * Object.keys(localInstance.registration);
    }
}

const localInstance = new Config();
const config = new Proxy(Config, {
    get: (c, key) =>
    {
        if(!(key in config))
        {
            throw new Error(`${key} is not a registered resource`);
        }

        return localInstance.registration[key];
    },

    set: (c, key, val) =>
    {
        if(key in config)
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
        if(key in config)
        {
            delete localInstance.registration[key];

            return true;
        }

        throw new Error(`${key} is not a registered resource`);
    },

    construct: (c, [key, conf]) =>
    {
        localInstance.registration[key] = conf;

        return {};
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

export default config;
