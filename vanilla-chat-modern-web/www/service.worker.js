self.addEventListener("install", function(event) {
    event.waitUntil(caches.open("v1").then(function(cache) {
        return cache.addAll([
            "/vendors/Rx.min.js",
            
            "/service.worker.js",
            
            "/scripts/data.js",
            "/scripts/connection.js",
            "/scripts/manager.js",
            "/scripts/index.js",
            
            "/img/background.jpg",

            "/styles/index.css"
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