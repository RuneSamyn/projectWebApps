const staticCacheName = "static-version-1";
const dynamicCacheName = "dynamic-version-1";

const StaticFilesToCache = [
	'fallback',
	'manifest.json',
	'images/icons/icon-72x72.png',
	'images/icons/icon-96x96.png',
	'images/icons/icon-128x128.png',
	'images/icons/icon-144x144.png',
	'images/icons/icon-152x152.png',
	'images/icons/icon-192x192.png',
	'images/icons/icon-384x384.png',
	'images/icons/icon-512x512.png',
	'images/launch-screens/launch-screen-2048x2732.png',
	'images/launch-screens/launch-screen-2732x2048.png',
	'images/launch-screens/launch-screen-1668x2388.png',
	'images/launch-screens/launch-screen-2388x1668.png',
	'images/launch-screens/launch-screen-1668x2224.png',
	'images/launch-screens/launch-screen-2224x1668.png',
	'images/launch-screens/launch-screen-1536x2048.png',
	'images/launch-screens/launch-screen-2048x1536.png',
	'images/launch-screens/launch-screen-1242x2688.png',
	'images/launch-screens/launch-screen-2688x1242.png',
	'images/launch-screens/launch-screen-828x1792.png',
	'images/launch-screens/launch-screen-1792x828.png',
	'images/launch-screens/launch-screen-1125x2436.png',
	'images/launch-screens/launch-screen-2436x1125.png',
	'images/launch-screens/launch-screen-1242x2208.png',
	'images/launch-screens/launch-screen-2208x1242.png',
	'images/launch-screens/launch-screen-750x1334.png',
	'images/launch-screens/launch-screen-1334x750.png',
	'images/launch-screens/launch-screen-640x1136.png',
	'images/launch-screens/launch-screen-1136x640.png',
	'images/favicons/apple-touch-icon-57x57.png',
	'images/favicons/apple-touch-icon-60x60.png',
	'images/favicons/apple-touch-icon-72x72.png',
	'images/favicons/apple-touch-icon-76x76.png',
	'images/favicons/apple-touch-icon-114x114.png',
	'images/favicons/apple-touch-icon-120x120.png',
	'images/favicons/apple-touch-icon-144x144.png',
	'images/favicons/apple-touch-icon-152x152.png',
	'images/favicons/favicon-16x16.png',
	'images/favicons/favicon-32x32.png',
	'images/favicons/favicon-96x96.png',
	'images/favicons/favicon-128x128.png',
	'images/favicons/favicon-196x196.png',
	'images/favicons/ms-tile-70x70.png',
	'images/favicons/ms-tile-144x144.png',
	'images/favicons/ms-tile-150x150.png',
	'images/favicons/ms-tile-310x150.png',
	'images/favicons/ms-tile-310x310.png',
];

self.addEventListener('install', event => {
    console.log('Service worker installed: ', event);

    event.waitUntil(
        caches.open(staticCacheName).then(cache => {
            console.log('Caching static files.');
            cache.addAll(StaticFilesToCache);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('Service worker activated: ', event);

    event.waitUntil(
        caches.keys().then(keys => {
            console.log('Cache keys: ', keys);

            return Promise.all(keys
                .filter(key => (key !== staticCacheName) && (key !== dynamicCacheName))
                .map(key => caches.delete(key)));
        })
    );
});

self.addEventListener('fetch', event => {
    console.log('Fetch event: ', event);

    event.respondWith(
        caches.match(event.request).then(cacheResponse => {
            return cacheResponse || fetch(event.request)
                .then(fetchResponse => {
                    return caches.open(dynamicCacheName)
                        .then(cache => {
                            cache.put(event.request.url, fetchResponse.clone());
                            return fetchResponse;
                        })
                })
                // Indien data ophalen niet mogelijk is (offline), toon de fallback page.
                .catch(() => {
                    // Toon enkel voor HTML-bestanden de fallback page.
                    if(event.request.url.indexOf('.html') >= 0) {
						console.log('fallback to offline page')
						return caches.open(staticCacheName)
							.then(cache => {
								return cache.match('/fallback');
							})
					}
                });
        })
    );
});