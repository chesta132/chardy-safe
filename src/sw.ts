/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope;

// injected by vite-plugin-pwa at build time
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // intercept the share target POST
  if (url.pathname === "/file" && event.request.method === "POST") {
    event.respondWith(handleShareTarget(event.request));
    return;
  }
});

async function handleShareTarget(request: Request): Promise<Response> {
  const formData = await request.formData();

  // stash formData in cache so the page can pick it up
  const cache = await caches.open("share-target");
  await cache.put("shared-file", new Response(formData));

  // redirect to /file with a marker so useShareTarget knows to check the cache
  return Response.redirect("/file?share-target", 303);
}
