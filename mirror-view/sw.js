// Mirror Trae — in-memory virtual server for the encrypted mirror.
// Scope: /mirror-view/. The viewer page (out of scope) decrypts the bundle and hands the file map
// here via postMessage; we hold it ONLY in memory (a Map, never the Cache API / disk) and serve it
// with a strict CSP. Closing the tab, locking, or the browser evicting this worker drops everything.
// The mirror's own /mirror-view/sw.js and /mirror-view/mirror.bundle are passed through to the real
// GitHub Pages files (the SW script + the ciphertext); everything else under the scope is memory.

var MEM = null;
var SCOPE = "/mirror-view";
var CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://lf-static.traecdn.us https://lf-cdn.trae.ai",
  "media-src 'self' blob: https://lf-cdn.trae.ai https://lf-static.traecdn.us",
  "font-src 'self' data:",
  "connect-src 'self'",          // exfiltration lockdown: no external calls (telemetry/login die here)
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'none'"
].join("; ");

self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener("message", function (e) {
  var d = e.data || {};
  var port = e.ports && e.ports[0];
  if (d.type === "load") {
    try {
      var map = new Map();
      for (var p in d.bundle) {
        var ent = d.bundle[p];
        var bin = atob(ent.b), u = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
        map.set(p, { t: ent.t, bytes: u });
      }
      MEM = map;
      port && port.postMessage({ ok: true, count: MEM.size });
    } catch (err) {
      MEM = null;
      port && port.postMessage({ ok: false, error: String(err && err.message || err) });
    }
  } else if (d.type === "purge") {
    MEM = null;
    port && port.postMessage({ ok: true });
  }
});

function headers(type) {
  return {
    "Content-Type": type,
    "Content-Security-Policy": CSP,
    "Cross-Origin-Resource-Policy": "same-origin",
    "X-Served-From": "mirror-sw-memory"
  };
}

self.addEventListener("fetch", function (event) {
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;                                  // CDN images/video -> network
  if (url.pathname === SCOPE + "/sw.js" || url.pathname === SCOPE + "/mirror.bundle") return; // real files
  if (url.pathname !== SCOPE && url.pathname.indexOf(SCOPE + "/") !== 0) return;     // out of scope -> network
  event.respondWith((async function () {
    if (!MEM) return new Response("Mirror locked — re-open the viewer to unlock.", { status: 503, headers: { "Content-Type": "text/plain" } });
    var hit = MEM.get(url.pathname);
    if (hit) return new Response(hit.bytes, { headers: headers(hit.t) });
    if (!/\.[a-z0-9]+$/i.test(url.pathname)) {                                       // extensionless route -> SPA shell
      var idx = MEM.get(SCOPE + "/index.html");
      if (idx) return new Response(idx.bytes, { headers: headers(idx.t) });
    }
    return new Response("not found in mirror bundle: " + url.pathname, { status: 404, headers: { "Content-Type": "text/plain" } });
  })());
});
