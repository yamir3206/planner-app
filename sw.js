// Unregister old service worker to fix white screen from cached broken version
self.addEventListener('install', function(e) {
  self.skipWaiting();
});
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('Deleting cache', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      return self.registration.unregister();
    }).then(function() {
      console.log('SW unregistered, reloading clients');
      return self.clients.matchAll();
    }).then(function(clients) {
      clients.forEach(client => client.navigate(client.url));
    })
  );
});
