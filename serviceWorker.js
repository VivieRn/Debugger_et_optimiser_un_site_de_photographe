const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration(
        "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/serviceWorker.js"
      );
      if (!registration) {
        const newRegistration = await navigator.serviceWorker.register(
          "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/serviceWorker.js",
          {
            scope:
              "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/",
          }
        );
        if (newRegistration.installing) {
          console.log("Installation du service worker en cours");
        } else if (newRegistration.waiting) {
          console.log("Service worker installé");
        } else if (newRegistration.active) {
          console.log("Service worker actif");
        }
      } else {
        console.log("Service worker déjà enregistré");
      }
    } catch (error) {
      console.error(`L'enregistrement a échoué : ${error}`);
    }
  }
};

const whitelistedOrigins = ["https://viviern.github.io/"];

// Version du Service Worker
const version = "v1-NCP";

// Fichiers à mettre en cache
const filesToCache = [
  "./serviceWorker.js",
  "./assets/maugallery.js",
  "./assets/scripts.js",
  "./assets/bootstrap/bootstrap.bundle.js",
  "./assets/bootstrap/bootstrap.bundle.js.map",
  "./assets/bootstrap/bootstrap.bundle.min.js",
  "./assets/bootstrap/bootstrap.bundle.min.js.map",
];

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

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});

registerServiceWorker();
