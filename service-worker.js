/* Cette version désactive définitivement les anciens caches hors ligne.
   Une application vendue ne doit jamais afficher une page périmée à l'ouverture. */
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    await Promise.all((await caches.keys()).map((key) => caches.delete(key)));
    await self.clients.claim();
    await self.registration.unregister();
  })());
});
