/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

declare const self: ServiceWorkerGlobalScope;

// injected by vite-plugin-pwa at build time
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// handle SPA navigation offline
const handler = createHandlerBoundToURL("/index.html");
const navigationRoute = new NavigationRoute(handler);
registerRoute(navigationRoute);

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // intercept share target POST (from Android/mobile share sheet)
  if (url.pathname === "/file" && event.request.method === "POST") {
    event.respondWith(handleShareTarget(event.request));
    return;
  }
});

async function handleShareTarget(request: Request): Promise<Response> {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  console.log(file);
  if (!file) return Response.redirect("/file", 303);

  // convert to base64 so we can safely store in cache
  const buffer = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

  const payload = JSON.stringify({
    name: file.name,
    type: file.type,
    data: base64,
  });

  const cache = await caches.open("files");
  await cache.put(
    "incoming-file",
    new Response(payload, {
      headers: { "Content-Type": "application/json" },
    }),
  );

  // redirect to /file with marker so useIncomingFile knows to check cache
  return Response.redirect("/file?incoming-file", 303);
}
