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
let modalGroup = [];
let modalIndex = 0;

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

document.querySelectorAll("[data-slider]").forEach((slider) => {
  const slides = Array.from(slider.querySelectorAll("[data-slide]"));
  const dots = Array.from(slider.querySelectorAll("[data-slide-dot]"));
  const prev = slider.querySelector("[data-slider-prev]");
  const next = slider.querySelector("[data-slider-next]");
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
