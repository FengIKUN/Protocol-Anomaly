const CACHE_NAME = 'oblivion-cache-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
    console.log('[Service Worker] Installed. System proxy online.');
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
    console.log('[Service Worker] Activated. Intercepting requests...');
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    if (url.pathname === '/api/mia/recovery_pulse') {
        event.respondWith(
            new Promise((resolve) => {
                setTimeout(() => {
                    const mockResponse = new Response(
                        JSON.stringify({
                            status: 200,
                            sys_msg: "UI_RENDER_FAILURE: Cognitive matrix overloaded.",
                            hint: "Look up. The key is in the headers."
                        }),
                        {
                            status: 200,
                            statusText: 'OK',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Hidden-Activation-Key': 'AXIOM_FALLS',
                                'Server': 'Oblivion_Core_v9'
                            }
                        }
                    );
                    resolve(mockResponse);
                }, 800);
            })
        );
        return;
    }

    if (url.pathname === '/doomsday_vault') {
        if (!navigator.onLine) {
            event.respondWith(new Response("Welcome to the Offline Vault, Admin.", { status: 200 }));
        } else {
            event.respondWith(new Response("Access Denied. Connection to external net detected.", { status: 403 }));
        }
        return;
    }

    event.respondWith(fetch(event.request));
});