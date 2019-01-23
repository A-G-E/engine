self.addEventListener('fetch', e => {
    console.log(e);

    e.respondWith(fetch(e.request));
});