const CACHE_NAME = 'guess-country-v1';
const ASSETS = [
  'index.html',
  'style.css',
  'script.js',
  'manifest.json'
];

// Instalação: Salva os arquivos essenciais
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Estratégia: Tenta a rede, se falhar (offline), usa o cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});