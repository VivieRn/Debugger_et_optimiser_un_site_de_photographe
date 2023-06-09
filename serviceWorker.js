const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration(
        "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/"
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
  "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/serviceWorker.js",
  "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/assets/maugallery.js",
  "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/assets/bootstrap/bootstrap.bundle.js",
  "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/assets/bootstrap/bootstrap.bundle.js.map",
  "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/assets/bootstrap/bootstrap.bundle.min.js",
  "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/assets/bootstrap/bootstrap.bundle.min.js.map",
  "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/assets/images/slider/ryoji-iwata-wUZjnOv7t0g-unsplash_large.webp",
  "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/assets/images/slider/nicholas-green-nPz8akkUmDI-unsplash_large.webp",
  "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/assets/images/slider/edward-cisneros-3_h6-1NPDGw-unsplash_large.webp",
  "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/assets/images/nina_large.webp",
  "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/assets/images/gallery/concerts/aaron-paul-wnX-fXzB6Cw-unsplash_medium.webp",
  "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/assets/images/gallery/entreprise/ali-morshedlou-WMD64tMfc4k-unsplash_medium.webp",
  "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/assets/images/gallery/entreprise/jason-goodman-tHO1_OuKbg0-unsplash_medium.webp",
  "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/assets/images/gallery/mariage/hannah-busing-RvF2R_qMpRk-unsplash_medium.webp",
  "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/assets/images/gallery/portraits/ade-tunji-rVkhWWZFAtQ-unsplash_medium.webp",
  "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/assets/images/gallery/mariage/jakob-owens-SiniLJkXhMc-unsplash_medium.webp",
  "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/assets/images/gallery/portraits/nino-van-prattenburg--443cl1uR_8-unsplash_medium.webp",
  "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/assets/images/gallery/concerts/austin-neill-hgO1wFPXl3I-unsplash_medium.webp",
  "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/assets/images/gallery/entreprise/mateus-campos-felipe-Fsgzm8N0hIY-unsplash_medium.webp",
  "https://viviern.github.io/Debugger_et_optimiser_un_site_de_photographe/assets/images/camera_large.webp",
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
    caches.open(version).then(function (cache) {
      return cache.match(event.request).then(function (response) {
        return (
          response ||
          fetch(event.request).then(function (networkResponse) {
            if (isWhitelistedOrigin(event.request)) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
        );
      });
    })
  );
});

registerServiceWorker();
