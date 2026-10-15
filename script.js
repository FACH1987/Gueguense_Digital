document.documentElement.classList.add("js");

const menuToggle = document.querySelector(".menu-toggle");
const siteNavigation = document.querySelector(".site-nav");

if (menuToggle && siteNavigation) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    siteNavigation.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute("aria-label", isExpanded ? "Abrir menú" : "Cerrar menú");
    siteNavigation.classList.toggle("is-open", !isExpanded);
  });

  siteNavigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuToggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!siteNavigation.contains(event.target) && !menuToggle.contains(event.target)) {
      closeMenu();
    }
  });
}

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) {
      return;
    }

    const formData = new FormData(contactForm);
    const name = String(formData.get("name")).trim();
    const email = String(formData.get("email")).trim();
    const service = String(formData.get("service"));
    const message = String(formData.get("message")).trim();
    const inquiry = [
      "Hola, soy " + name + ".",
      "Mi correo es " + email + ".",
      "Me interesa: " + service + ".",
      message ? "Sobre mi proyecto: " + message : "",
    ].filter(Boolean).join("\n");
    const whatsappUrl = "https://wa.me/14085049624?text=" + encodeURIComponent(inquiry);

    formStatus.replaceChildren(
      document.createTextNode("Tu consulta está lista. Continúa a WhatsApp para revisar y enviar el mensaje. "),
      Object.assign(document.createElement("a"), {
        href: whatsappUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        textContent: "Abrir WhatsApp →",
      }),
    );
  });
}

const year = document.querySelector("#year");
if (year) {
  year.textContent = String(new Date().getFullYear());
}

const revealTargets = document.querySelectorAll(
  ".section-heading, .service-card, .project-card, .about-visual, .about-copy, .contact-copy, .contact-form",
);

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealTargets.forEach((target) => {
    target.classList.add("reveal");
    revealObserver.observe(target);
  });
}
