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

const reviewForm = document.querySelector("#review-form");

if (reviewForm) {
  const reviewFields = document.querySelector("#review-fields");
  const reviewSubmit = document.querySelector("#review-submit");
  const reviewFormStatus = document.querySelector("#review-form-status");
  const reviewServiceStatus = document.querySelector("#reviews-service-status");
  const reviewList = document.querySelector("#reviews-list");
  const reviewEmpty = document.querySelector("#reviews-empty");
  const reviewCount = document.querySelector("#reviews-count");
  const averageRating = document.querySelector("#reviews-average");
  const filledAverageStars = document.querySelector("#reviews-stars-filled");
  const emptyAverageStars = document.querySelector("#reviews-stars-empty");
  const ratingOptions = document.querySelector(".rating-options");
  const siteLikeButton = document.querySelector("#site-like-button");
  const siteLikeCount = document.querySelector("#site-like-count");
  const siteLikeStatus = document.querySelector("#site-like-status");
  const visitorStorageKey = "gueguense-digital-visitor-v1";
  const likeStorageKey = "gueguense-digital-liked-v1";
  const suppliedConfig = window.GueguenseSupabaseConfig || {};
  let visitorId;
  let currentLikeCount = 0;

  const databaseUrl = typeof suppliedConfig.url === "string" ? suppliedConfig.url.trim().replace(/\/+$/, "") : "";
  const anonKey = typeof suppliedConfig.anonKey === "string" ? suppliedConfig.anonKey.trim() : "";
  let isConfigured = false;

  try {
    const parsedDatabaseUrl = new URL(databaseUrl);
    const isAllowedHost = parsedDatabaseUrl.hostname.endsWith(".supabase.co")
      || parsedDatabaseUrl.hostname === "localhost"
      || parsedDatabaseUrl.hostname === "127.0.0.1";
    const isSecureOrigin = parsedDatabaseUrl.protocol === "https:"
      || (parsedDatabaseUrl.protocol === "http:" && (parsedDatabaseUrl.hostname === "localhost" || parsedDatabaseUrl.hostname === "127.0.0.1"));

    isConfigured = Boolean(databaseUrl && anonKey && isAllowedHost && isSecureOrigin);
  } catch {
    isConfigured = false;
  }

  const createVisitorId = () => {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20),
    ].join("-");
  };

  const getVisitorId = () => {
    try {
      const savedId = window.localStorage.getItem(visitorStorageKey);
      if (savedId && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(savedId)) {
        return savedId;
      }

      const newId = createVisitorId();
      window.localStorage.setItem(visitorStorageKey, newId);
      return newId;
    } catch (error) {
      console.warn("No se pudo guardar el identificador anónimo de preferencias en este navegador.", error);
      return createVisitorId();
    }
  };

  const getSavedLikeState = () => {
    try {
      return window.localStorage.getItem(likeStorageKey) === "true";
    } catch (error) {
      console.warn("No se pudo recuperar el estado anónimo del me gusta.", error);
      return false;
    }
  };

  const supabaseRequest = async (endpoint, { method = "GET", body, prefer } = {}) => {
    const headers = {
      apikey: anonKey,
      Authorization: "Bearer " + anonKey,
      Accept: "application/json",
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    if (prefer) {
      headers.Prefer = prefer;
    }

    const response = await fetch(databaseUrl + "/rest/v1/" + endpoint, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error("Supabase respondió con HTTP " + response.status + (details ? ": " + details.slice(0, 400) : ""));
    }

    const responseBody = await response.text();
    if (!responseBody) {
      return null;
    }

    try {
      return JSON.parse(responseBody);
    } catch (error) {
      throw new Error("Supabase respondió con datos JSON no válidos.", { cause: error });
    }
  };

  const unpackSummary = (result) => {
    const summary = Array.isArray(result) ? result[0] : result;
    if (!summary || typeof summary !== "object") {
      throw new Error("La respuesta de resumen no contiene datos.");
    }
    return summary;
  };

  const renderSummary = (summary) => {
    const numberOfReviews = Number(summary.review_count);
    const meanRating = Number(summary.average_rating);
    currentLikeCount = Number(summary.like_count);

    if (![numberOfReviews, meanRating, currentLikeCount].every(Number.isFinite)) {
      throw new Error("El resumen recibido contiene datos no válidos.");
    }

    averageRating.textContent = numberOfReviews ? meanRating.toFixed(1) : "—";
    averageRating.setAttribute("aria-label", numberOfReviews ? meanRating.toFixed(1) + " de 5" : "Aún no hay calificaciones");
    const filledStars = numberOfReviews ? Math.round(meanRating) : 0;
    filledAverageStars.textContent = "★".repeat(filledStars);
    emptyAverageStars.textContent = "☆".repeat(5 - filledStars);
    averageRating.parentElement.querySelector(".review-stars").setAttribute(
      "aria-label",
      numberOfReviews ? "Calificación promedio: " + meanRating.toFixed(1) + " de 5 estrellas" : "Aún no hay calificaciones",
    );
    reviewCount.textContent = numberOfReviews === 1 ? "1 reseña de clientes" : numberOfReviews + " reseñas de clientes";
    siteLikeCount.textContent = String(currentLikeCount);
    siteLikeButton.setAttribute("aria-label", "Me gusta esta página. " + currentLikeCount + (currentLikeCount === 1 ? " me gusta" : " me gusta"));
  };

  const renderReviews = (reviews) => {
    if (!Array.isArray(reviews)) {
      throw new Error("La respuesta de reseñas no tiene el formato esperado.");
    }

    const reviewCards = reviews.map((review) => {
      const rating = Number(review.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error("Se recibió una calificación fuera del rango esperado.");
      }

      const card = document.createElement("article");
      card.className = "review-card";

      const top = document.createElement("div");
      top.className = "review-card-top";
      const stars = document.createElement("span");
      stars.className = "review-card-rating";
      stars.setAttribute("aria-label", rating + " de 5 estrellas");
      stars.textContent = "★".repeat(rating) + "☆".repeat(5 - rating);
      const date = document.createElement("time");
      date.className = "review-card-date";
      const parsedDate = new Date(review.created_at);
      if (!Number.isNaN(parsedDate.getTime())) {
        date.dateTime = parsedDate.toISOString();
        date.textContent = new Intl.DateTimeFormat("es-NI", { dateStyle: "medium" }).format(parsedDate);
      }
      top.append(stars, date);

      const comment = document.createElement("p");
      comment.className = "review-card-comment";
      comment.textContent = String(review.comment);

      const author = document.createElement("div");
      author.className = "review-card-author";
      const avatar = document.createElement("span");
      avatar.className = "review-avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = Array.from(String(review.name).trim())[0]?.toLocaleUpperCase("es-NI") || "?";
      const name = document.createElement("strong");
      name.textContent = String(review.name);
      author.append(avatar, name);
      card.append(top, comment, author);
      return card;
    });

    reviewList.replaceChildren(...reviewCards);
    reviewEmpty.hidden = reviewCards.length > 0;
  };

  const refreshReviews = async () => {
    const query = new URLSearchParams({
      select: "id,name,rating,comment,created_at",
      order: "created_at.desc",
      limit: "9",
    });

    try {
      const [summaryResult, reviews] = await Promise.all([
        supabaseRequest("rpc/get_public_summary", { method: "POST", body: {} }),
        supabaseRequest("reviews?" + query),
      ]);
      renderSummary(unpackSummary(summaryResult));
      renderReviews(reviews);
      return true;
    } catch (error) {
      console.error("No se pudieron cargar las reseñas y el resumen público.", error);
      reviewServiceStatus.textContent = "El espacio de opiniones todavía no está disponible. Vuelve a intentarlo más tarde.";
      reviewCount.textContent = "No se pudieron cargar las reseñas";
      averageRating.textContent = "—";
      reviewEmpty.hidden = true;
      return false;
    }
  };

  ratingOptions.addEventListener("change", (event) => {
    if (event.target instanceof HTMLInputElement && event.target.name === "rating") {
      ratingOptions.dataset.rating = event.target.value;
    }
  });

  reviewForm.addEventListener("reset", () => {
    window.setTimeout(() => {
      delete ratingOptions.dataset.rating;
    }, 0);
  });

  reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!reviewForm.reportValidity() || reviewSubmit.disabled) {
      return;
    }

    const formData = new FormData(reviewForm);
    const name = String(formData.get("name")).trim();
    const comment = String(formData.get("comment")).trim();
    const rating = Number(formData.get("rating"));

    reviewSubmit.disabled = true;
    reviewFormStatus.textContent = "Publicando tu reseña...";

    try {
      await supabaseRequest("reviews", {
        method: "POST",
        body: { name, rating, comment },
        prefer: "return=minimal",
      });
      reviewForm.reset();
      reviewFormStatus.textContent = "¡Gracias por compartir tu experiencia! Tu reseña ya es visible para todos.";
      await refreshReviews();
    } catch (error) {
      console.error("No se pudo publicar la reseña.", error);
      reviewFormStatus.textContent = "No pudimos publicar tu reseña. Comprueba tu conexión e inténtalo de nuevo.";
    } finally {
      reviewSubmit.disabled = false;
    }
  });

  siteLikeButton.addEventListener("click", async () => {
    if (!visitorId || siteLikeButton.disabled) {
      return;
    }

    siteLikeButton.disabled = true;
    siteLikeStatus.textContent = "Actualizando...";

    try {
      const result = await supabaseRequest("rpc/toggle_site_like", {
        method: "POST",
        body: { p_visitor_id: visitorId },
      });
      const reaction = unpackSummary(result);
      if (typeof reaction.liked !== "boolean" || !Number.isFinite(Number(reaction.like_count))) {
        throw new Error("La respuesta del servidor no contiene el estado esperado del me gusta.");
      }

      currentLikeCount = Number(reaction.like_count);
      siteLikeCount.textContent = String(currentLikeCount);
      siteLikeButton.setAttribute("aria-pressed", String(reaction.liked));
      siteLikeButton.setAttribute("aria-label", "Me gusta esta página. " + currentLikeCount + " me gusta");
      siteLikeStatus.textContent = reaction.liked ? "¡Gracias por tu apoyo!" : "Quitaste tu me gusta.";

      try {
        window.localStorage.setItem(likeStorageKey, String(reaction.liked));
      } catch (error) {
        console.warn("No se pudo guardar el estado local del me gusta.", error);
      }
    } catch (error) {
      console.error("No se pudo actualizar el me gusta.", error);
      siteLikeStatus.textContent = "No se pudo actualizar tu me gusta. Inténtalo de nuevo.";
    } finally {
      siteLikeButton.disabled = false;
    }
  });

  if (isConfigured) {
    try {
      const parsedDatabaseUrl = new URL(databaseUrl);
      if (anonKey.startsWith("sb_secret_") || anonKey.startsWith("service_role")) {
        throw new Error("La configuración debe utilizar la clave pública anon o publishable, nunca una clave secreta.");
      }
      if (parsedDatabaseUrl.pathname !== "/" || parsedDatabaseUrl.search || parsedDatabaseUrl.hash) {
        throw new Error("La URL de Supabase debe ser la dirección del proyecto, sin rutas ni parámetros.");
      }

      visitorId = getVisitorId();
      siteLikeButton.setAttribute("aria-pressed", String(getSavedLikeState()));
      reviewServiceStatus.textContent = "Conectando con el espacio de opiniones...";
      refreshReviews().then((isReady) => {
        if (isReady) {
          reviewFields.disabled = false;
          reviewSubmit.disabled = false;
          siteLikeButton.disabled = false;
          reviewServiceStatus.textContent = "Las reseñas publicadas son visibles para todos los visitantes; comparte solo una opinión que aceptes hacer pública.";
        }
      });
    } catch (error) {
      console.error("La configuración de Supabase no es válida.", error);
      reviewServiceStatus.textContent = "Las opiniones no están disponibles en este momento. Inténtalo de nuevo más tarde.";
    }
  } else {
    reviewCount.textContent = "Opiniones próximas";
    reviewEmpty.textContent = "Estamos preparando este espacio para compartir las experiencias de nuestros clientes.";
    reviewEmpty.hidden = false;
    reviewServiceStatus.textContent = "Las reseñas y los “me gusta” estarán disponibles cuando se complete la configuración de la base de datos.";
  }
}

const revealTargets = document.querySelectorAll(
  ".section-heading, .service-card, .project-card, .review-summary, .review-like-card, .review-card, .review-form, .about-visual, .about-copy, .contact-copy, .contact-form",
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
