self.addEventListener("install", function(event) {
    event.waitUntil(caches.open("v1").then(function(cache) {
        return cache.addAll([
            "/styles/index.css",
            "/scripts/index.js",
            "/scripts/data.js",
            "/scripts/manager.js",
            "/scripts/connection.js",
            "/vendors/Rx.min.js",
            "/service.worker.js"
        ]);
    }));
});

self.addEventListener("fetch", function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response){
            return response || fetch(event.request);
        })
    );
});