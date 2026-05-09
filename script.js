const year = document.querySelector("[data-year]");
const toggle = document.querySelector("[data-theme-toggle]");
const root = document.documentElement;
const storedTheme = localStorage.getItem("theme");

if (year) {
  year.textContent = new Date().getFullYear();
}

if (storedTheme === "dark") {
  root.classList.add("dark");
}

if (toggle) {
  toggle.addEventListener("click", () => {
    root.classList.toggle("dark");
    localStorage.setItem("theme", root.classList.contains("dark") ? "dark" : "light");
  });
}

const momNote = document.querySelector(".mom-note");

document.addEventListener("click", (event) => {
  if (!momNote?.open || momNote.contains(event.target)) return;
  momNote.open = false;
});

document.addEventListener(
  "scroll",
  () => {
    if (momNote?.open) momNote.open = false;
  },
  { passive: true },
);

const modal = document.querySelector("[data-image-modal]");
const modalImage = document.querySelector("[data-modal-target]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalButtons = Array.from(document.querySelectorAll("[data-modal-image]"));
const closeButtons = document.querySelectorAll("[data-modal-close]");
const modalPrev = document.querySelector("[data-modal-prev]");
const modalNext = document.querySelector("[data-modal-next]");
const modalContent = document.querySelector(".modal-content");
let modalGroup = [];
let modalIndex = 0;

const addSwipeNavigation = (element, onPrevious, onNext) => {
  if (!element) return;

  let startX = 0;
  let startY = 0;
  let isTracking = false;
  let didSwipe = false;

  element.addEventListener(
    "pointerdown",
    (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      startX = event.clientX;
      startY = event.clientY;
      isTracking = true;
      didSwipe = false;
    },
    { passive: true },
  );

  element.addEventListener(
    "pointerup",
    (event) => {
      if (!isTracking) return;
      isTracking = false;

      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      const isHorizontalSwipe = Math.abs(deltaX) > 46 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2;

      if (!isHorizontalSwipe) return;
      didSwipe = true;

      if (deltaX < 0) {
        onNext();
      } else {
        onPrevious();
      }
    },
    { passive: true },
  );

  element.addEventListener(
    "pointercancel",
    () => {
      isTracking = false;
    },
    { passive: true },
  );

  element.addEventListener(
    "click",
    (event) => {
      if (!didSwipe) return;
      event.preventDefault();
      event.stopPropagation();
      didSwipe = false;
    },
    true,
  );
};

const setModalImage = (button) => {
  if (!modal || !modalImage || !modalTitle || !button) return;
  const src = button.getAttribute("data-modal-image");
  const caption = button.getAttribute("data-modal-caption") || "Project preview";

  if (!src) return;
  modalImage.src = src;
  modalImage.alt = caption;
  modalTitle.textContent = caption;
  modal.hidden = false;
};

const closeModal = () => {
  if (!modal || !modalImage || !modalTitle) return;
  modal.hidden = true;
  modalImage.removeAttribute("src");
  modalImage.alt = "";
  modalTitle.textContent = "";
};

modalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.getAttribute("data-modal-group");
    modalGroup = modalButtons.filter((item) => item.getAttribute("data-modal-group") === group);
    modalIndex = modalGroup.indexOf(button);
    setModalImage(button);
  });
});

closeButtons.forEach((button) => {
  button.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
  if (event.key === "ArrowLeft") modalPrev?.click();
  if (event.key === "ArrowRight") modalNext?.click();
});

modalPrev?.addEventListener("click", () => {
  if (!modalGroup.length || modal?.hidden) return;
  modalIndex = (modalIndex - 1 + modalGroup.length) % modalGroup.length;
  setModalImage(modalGroup[modalIndex]);
});

modalNext?.addEventListener("click", () => {
  if (!modalGroup.length || modal?.hidden) return;
  modalIndex = (modalIndex + 1) % modalGroup.length;
  setModalImage(modalGroup[modalIndex]);
});

addSwipeNavigation(
  modalContent,
  () => modalPrev?.click(),
  () => modalNext?.click(),
);

document.querySelectorAll("[data-slider]").forEach((slider) => {
  const slides = Array.from(slider.querySelectorAll("[data-slide]"));
  const dots = Array.from(slider.querySelectorAll("[data-slide-dot]"));
  const prev = slider.querySelector("[data-slider-prev]");
  const next = slider.querySelector("[data-slider-next]");
  const track = slider.querySelector(".slider-track");
  let activeIndex = 0;

  const showSlide = (index) => {
    if (!slides.length) return;
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  };

  prev?.addEventListener("click", () => showSlide(activeIndex - 1));
  next?.addEventListener("click", () => showSlide(activeIndex + 1));

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showSlide(Number(dot.getAttribute("data-slide-dot")));
    });
  });

  addSwipeNavigation(
    track,
    () => showSlide(activeIndex - 1),
    () => showSlide(activeIndex + 1),
  );
});

const sectionLinks = Array.from(document.querySelectorAll("[data-section-link]"));
const linkedSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const setActiveSection = (id) => {
  sectionLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
  });
};

if ("IntersectionObserver" in window && linkedSections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) setActiveSection(visible.target.id);
    },
    { rootMargin: "-35% 0px -45% 0px", threshold: [0.1, 0.35, 0.6] },
  );

  linkedSections.forEach((section) => observer.observe(section));
}

const pageTargets = [document.querySelector(".hero"), ...document.querySelectorAll("main > .section")].filter(Boolean);
const mobilePageQuery = window.matchMedia("(max-width: 780px)");
let pageSwipeStart = null;

const getCurrentPageIndex = () => {
  const viewportCenter = window.innerHeight / 2;
  return pageTargets.reduce(
    (closest, section, index) => {
      const rect = section.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
      return distance < closest.distance ? { index, distance } : closest;
    },
    { index: 0, distance: Number.POSITIVE_INFINITY },
  ).index;
};

const isPageSwipeExcluded = (target) =>
  target.closest(
    "a, button, summary, input, textarea, select, [data-slider], .image-modal, .section-nav, .mom-note",
  );

document.addEventListener(
  "pointerdown",
  (event) => {
    if (!mobilePageQuery.matches || isPageSwipeExcluded(event.target)) {
      pageSwipeStart = null;
      return;
    }

    pageSwipeStart = { x: event.clientX, y: event.clientY };
  },
  { passive: true },
);

document.addEventListener(
  "pointerup",
  (event) => {
    if (!pageSwipeStart || !mobilePageQuery.matches) return;

    const deltaX = event.clientX - pageSwipeStart.x;
    const deltaY = event.clientY - pageSwipeStart.y;
    pageSwipeStart = null;

    const isHorizontalSwipe = Math.abs(deltaX) > 64 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35;
    if (!isHorizontalSwipe) return;

    event.preventDefault();

    const currentIndex = getCurrentPageIndex();
    const nextIndex = deltaX < 0 ? currentIndex + 1 : currentIndex - 1;
    const nextSection = pageTargets[Math.max(0, Math.min(pageTargets.length - 1, nextIndex))];
    nextSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  },
  { passive: false },
);
