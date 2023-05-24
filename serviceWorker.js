if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/serviceWorker.js", {
      scope: "/",
    })
    .then(function (registration) {
      console.log(
        "ServiceWorker registration successful with scope: ",
        registration.scope
      );
    })
    .catch(function (error) {
      console.log("ServiceWorker registration failed: ", error);
    });
}

const whitelistedOrigins = [
  "http://localhost",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

const whitelistedPathRegex = /^\/api\/(?!.*\.(?:jpe?g|png)$)[^/]*$/;

// Version du Service Worker
const version = "v1";

// Fichiers à mettre en cache
const filesToCache = [];

// Vérifie si l'origine est autorisée
function isWhitelistedOrigin(request) {
  const origin = request.origin || request.url;
  return whitelistedOrigins.some((url) => origin.startsWith(url));
}

// Événement d'installation du Service Worker
self.addEventListener("install", function (event) {
  console.log(`[${version}] Installing Service Worker`);

  // Mettre en cache les fichiers de l'application Web
  event.waitUntil(
    caches
      .open(version)
      .then(function (cache) {
        return cache.addAll(filesToCache);
      })
      .then(function () {
        console.log(`[${version}] All required resources have been cached`);
      })
  );
});

// Événement d'activation du Service Worker
self.addEventListener("activate", function (event) {
  console.log(`[${version}] Activating Service Worker`);

  // Supprimer les anciennes versions du cache
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) {
              return key !== version;
            })
            .map(function (key) {
              return caches.delete(key);
            })
        );
      })
      .then(function () {
        console.log(`[${version}] Service Worker has been activated`);
      })
  );
});
