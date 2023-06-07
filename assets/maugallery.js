(function () {
  function mauGallery(element, options) {
    var defaultOptions = {
      columns: 3,
      lightBox: true,
      lightboxId: "galleryLightbox",
      showTags: true,
      tagsPosition: "bottom",
      navigation: true,
    };
    options = Object.assign({}, defaultOptions, options);

    var tagsCollection = [];

    //Création de la barre de filtres
    function showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>';
      tags.forEach(function (value) {
        tagItems +=
          '<li class="nav-item active">' +
          '<span class="nav-link" data-images-toggle="' +
          value +
          '">' +
          value +
          "</span></li>";
      });
      var tagsRow =
        '<ul class="my-4 tags-bar nav nav-pills">' + tagItems + "</ul>";

      var galleryWrapper = gallery.parentNode;
      var tagsContainer = document.createElement("div");
      tagsContainer.innerHTML = tagsRow;

      if (position === "bottom") {
        galleryWrapper.appendChild(tagsContainer);
      } else if (position === "top") {
        galleryWrapper.insertBefore(tagsContainer, gallery);
      } else {
        console.error("Unknown tags position: " + position);
        return;
      }
    }

    //Items filtrés par catégorie/tag
    function filterByTag() {
      if (this.classList.contains("active-tag")) {
        return;
      }
      var activeTags = document.querySelectorAll(".active-tag");
      activeTags.forEach(function (tag) {
        tag.classList.remove("active");
        tag.classList.remove("active-tag");
      });
      this.classList.add("active-tag");

      var tag = this.getAttribute("data-images-toggle");

      var galleryItems = document.querySelectorAll(".gallery-item");
      galleryItems.forEach(function (item) {
        var column = item.closest(".item-column");
        column.style.opacity = 0; // Initial opacity set to 0

        // Hide or show the column based on the tag
        if (tag === "all" || item.dataset.galleryTag === tag) {
          column.style.display = "block";
          fadeIn(column, 150); // Apply fadeIn animation to show the column
        } else {
          column.style.display = "none";
        }
      });
    }

    // Fonction d'animation des items lors du changement de catégorie
    function fadeIn(element, duration) {
      element.style.opacity = 0.2;
      element.style.transformOrigin = "top left";
      element.style.transform = "translate(-50px, -50px)";

      var startTime = null;

      function animation(currentTime) {
        if (!startTime) {
          startTime = currentTime;
        }

        var elapsed = currentTime - startTime;
        var opacity = elapsed / duration;
        var positionX = (elapsed / duration) * 50; // Move 20px to the right
        var positionY = (elapsed / duration) * 50; // Move 20px down

        element.style.opacity = Math.min(opacity, 1);
        element.style.transform =
          "translate(" + (positionX - 50) + "px, " + (positionY - 50) + "px)";

        if (elapsed < duration) {
          requestAnimationFrame(animation);
        }
      }

      requestAnimationFrame(animation);
    }

    // Alignement des items
    function createRowWrapper(element) {
      if (!element.children[0].classList.contains("row")) {
        var rowWrapper = document.createElement("div");
        rowWrapper.classList.add("gallery-items-row", "row");
        element.appendChild(rowWrapper);
      }
    }

    //Création des colonnes en fonctions de la largeur de la fenetre
    function wrapItemInColumn(element, columns) {
      function updateColumnClasses() {
        var windowWidth = window.innerWidth;
        var columnClasses = "";

        if (windowWidth >= 1200 && columns.xl) {
          columnClasses += `col-${Math.ceil(12 / columns.xl)}`;
        } else if (windowWidth >= 992 && columns.lg) {
          columnClasses += `col-${Math.ceil(12 / columns.lg)}`;
        } else if (windowWidth >= 768 && columns.md) {
          columnClasses += `col-${Math.ceil(12 / columns.md)}`;
        } else if (windowWidth >= 576 && columns.sm) {
          columnClasses += `col-${Math.ceil(12 / columns.sm)}`;
        } else if (columns.xs) {
          columnClasses += `col-${Math.ceil(12 / columns.xs)}`;
        } else {
          console.error(
            "Invalid columns object. At least one property is required."
          );
          return;
        }

        columnWrapper.className = `item-column ${columnClasses}`;
      }

      var columnWrapper = document.createElement("div");
      columnWrapper.classList.add("item-column");

      if (element.parentNode) {
        element.parentNode.insertBefore(columnWrapper, element);
      } else {
        console.error("Parent node is not defined for the element.");
        return;
      }

      columnWrapper.appendChild(element);

      updateColumnClasses(); // Appeler la fonction initiale pour définir les classes de colonne lors de l'initialisation

      // Ajouter un écouteur d'événement pour la redimension de la fenêtre
      window.addEventListener("resize", updateColumnClasses);
    }

    function moveItemInRowWrapper(element) {
      var rowWrapper = element.parentNode.parentNode;
      rowWrapper.appendChild(element.parentNode);
    }

    function responsiveImageItem(element) {
      if (element.tagName === "IMG") {
        element.classList.add("img-fluid");
      }
    }

    //Fonction de suppression d'élément sans Image
    function removeEmptyDivs() {
      var gallery = document.querySelector(element);
      var emptyDivs = Array.from(gallery.querySelectorAll("div")).filter(
        function (div) {
          return !div.querySelector("img");
        }
      );

      emptyDivs.forEach(function (div) {
        div.parentNode.removeChild(div);
      });
    }

    //Gestion de la Light Box
    function mauGalleryListeners(options) {
      var galleryItems = document.querySelectorAll(".gallery-item");
      galleryItems.forEach(function (item) {
        item.addEventListener("click", function () {
          if (options.lightBox && item.tagName === "IMG") {
            openLightBox(item, options.lightboxId);
          } else {
            return;
          }
        });
      });

      var gallery = document.querySelector(".gallery");
      gallery.addEventListener("click", function (event) {
        if (event.target.classList.contains("nav-link")) {
          filterByTag();
        } else if (event.target.classList.contains("mg-prev")) {
          prevImage(options.lightboxId);
        } else if (event.target.classList.contains("mg-next")) {
          nextImage(options.lightboxId);
        }
      });
    }

    function createLightBox(gallery, lightboxId, navigation) {
      var lightbox = document.createElement("div");
      lightbox.classList.add("modal", "fade");
      lightbox.id = lightboxId ? lightboxId : "galleryLightbox";
      lightbox.setAttribute("tabindex", "-1");
      lightbox.setAttribute("role", "dialog");
      lightbox.setAttribute("aria-hidden", "true");

      var modalDialog = document.createElement("div");
      modalDialog.classList.add("modal-dialog");
      modalDialog.setAttribute("role", "document");

      var modalContent = document.createElement("div");
      modalContent.classList.add("modal-content");

      var modalBody = document.createElement("div");
      modalBody.classList.add("modal-body");

      if (navigation) {
        var prevButton = document.createElement("div");
        prevButton.classList.add("mg-prev");
        prevButton.setAttribute(
          "style",
          "cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"
        );
        prevButton.innerText = "<";

        modalBody.appendChild(prevButton);
      } else {
        modalBody.appendChild(document.createElement("span"));
      }

      var lightboxImage = document.createElement("img");
      lightboxImage.classList.add("lightboxImage", "img-fluid");
      lightboxImage.setAttribute(
        "alt",
        "Contenu de l'image affichée dans la modale au clique"
      );
      modalBody.appendChild(lightboxImage);

      if (navigation) {
        var nextButton = document.createElement("div");
        nextButton.classList.add("mg-next");
        nextButton.setAttribute(
          "style",
          "cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}"
        );
        nextButton.innerText = ">";

        modalBody.appendChild(nextButton);
      } else {
        modalBody.appendChild(document.createElement("span"));
      }

      modalContent.appendChild(modalBody);
      modalDialog.appendChild(modalContent);
      lightbox.appendChild(modalDialog);

      gallery.appendChild(lightbox);
    }

    function openLightBox(element, lightboxId) {
      var lightbox = document.querySelector(`#${lightboxId}`);
      lightbox.style.display = "block";
      lightbox.setAttribute("aria-hidden", "false");
      var lightboxImage = lightbox.querySelector(".lightboxImage");
      lightboxImage.setAttribute("srcset", element.getAttribute("srcset"));
      lightbox.classList.add("show");
      if (lightbox.classList.contains("show")) {
        addCloseOutsideListener(lightboxId);
      }
    }

    function closeLightBox(lightboxId) {
      var lightbox = document.querySelector(`#${lightboxId}`);
      lightbox.style.display = "none";
      lightbox.setAttribute("aria-hidden", "true");
      lightbox.classList.remove("show");
    }

    // Ajoute un écouteur d'événement pour fermer la lightbox en cliquant à l'extérieur
    function addCloseOutsideListener(lightboxId) {
      var lightbox = document.querySelector(`#${lightboxId}`);
      var lightboxContent = lightbox.querySelector(".modal-content");

      // Écouteur d'événement pour les clics à l'extérieur de la lightbox
      lightbox.addEventListener("click", function (event) {
        if (event.target === lightbox || event.target === lightboxContent) {
          closeLightBox(lightboxId);
        }
      });
    }

    function prevImage() {
      const activeImage = document.querySelector(".lightboxImage");
      const activeSrcset = activeImage.getAttribute("srcset");
      const activeTag = document
        .querySelector(".tags-bar span.active-tag")
        .getAttribute("data-images-toggle");
      const imagesCollection = [];

      if (activeTag === "all") {
        document.querySelectorAll(".item-column img").forEach(function (img) {
          imagesCollection.push(img);
        });
      } else {
        document
          .querySelectorAll(`.item-column img[data-gallery-tag="${activeTag}"]`)
          .forEach(function (img) {
            imagesCollection.push(img);
          });
      }

      let index = 0;
      let prev = null;

      imagesCollection.forEach(function (img, i) {
        if (img.getAttribute("srcset") === activeSrcset) {
          index = i;
        }
      });

      if (index === 0) {
        prev = imagesCollection[imagesCollection.length - 1];
      } else {
        prev = imagesCollection[index - 1];
      }

      document
        .querySelector(".lightboxImage")
        .setAttribute("srcset", prev.getAttribute("srcset"));
    }

    function nextImage() {
      const activeImage = document.querySelector(".lightboxImage");
      const activeSrcset = activeImage.getAttribute("srcset");
      const activeTag = document
        .querySelector(".tags-bar span.active-tag")
        .getAttribute("data-images-toggle");
      const imagesCollection = [];

      if (activeTag === "all") {
        document.querySelectorAll(".item-column img").forEach(function (img) {
          imagesCollection.push(img);
        });
      } else {
        document
          .querySelectorAll(`.item-column img[data-gallery-tag="${activeTag}"]`)
          .forEach(function (img) {
            imagesCollection.push(img);
          });
      }

      let index = 0;
      let next = null;

      imagesCollection.forEach(function (img, i) {
        if (img.getAttribute("srcset") === activeSrcset) {
          index = i;
        }
      });

      if (index === imagesCollection.length - 1) {
        next = imagesCollection[0];
      } else {
        next = imagesCollection[index + 1];
      }

      document
        .querySelector(".lightboxImage")
        .setAttribute("srcset", next.getAttribute("srcset"));
    }

    // Fonction pour initialiser la grille de galerie
    function init(element, options) {
      var gallery = document.querySelector(element);
      gallery.style.display = "flex";
      gallery.classList.add("row");
      createRowWrapper(gallery);
      var galleryItems = Array.from(gallery.children);
      galleryItems.forEach(function (item) {
        item.classList.add("gallery-item");
        wrapItemInColumn(item, options.columns);
        moveItemInRowWrapper(item);
        responsiveImageItem(item);
        var tag = item.dataset.galleryTag;
        if (tag && !tagsCollection.includes(tag)) {
          tagsCollection.push(tag);
        }
      });

      if (options.showTags) {
        showItemTags(gallery, options.tagsPosition, tagsCollection);
      }

      var tagElements = document.querySelectorAll(".tags-bar .nav-link");
      tagElements.forEach(function (tag) {
        tag.addEventListener("click", filterByTag);
      });
      removeEmptyDivs();
      createLightBox(gallery, options.lightboxId, options.lightBox);
    }

    init(element, options);
    mauGalleryListeners(options);
  }

  // Options de mise en forme de la grille
  mauGallery(".gallery", {
    columns: {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 3,
      xl: 3,
    },
    lightBox: true,
    lightboxId: "galleryLightbox",
    showTags: true,
    tagsPosition: "top",
  });

  window.mauGallery = mauGallery;
})();
