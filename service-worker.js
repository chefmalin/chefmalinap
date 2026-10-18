/* Supprime les anciens caches d'application afin que NutriChef charge toujours la version publiée. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => {
  event.waitUntil(self.registration.unregister().catch(() => false));
});
