const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const backToTop = document.querySelector(".back-to-top");

/* MOBILE MENU */
menuToggle.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("open");

  menuToggle.classList.toggle("active", isOpen);
  menuToggle.setAttribute("aria-expanded", isOpen);
  document.body.classList.toggle("nav-open", isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("open");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  });
});

/* ACTIVE NAV LINK */
const sections = document.querySelectorAll("main section[id]");

const setActiveLink = () => {
  const scrollPosition = window.scrollY + 180;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute("id");

    if (
      scrollPosition >= sectionTop &&
      scrollPosition < sectionTop + sectionHeight
    ) {
      navLinks.forEach((link) => {
        link.classList.remove("active");

        if (link.getAttribute("href") === `#${sectionId}`) {
          link.classList.add("active");
        }
      });
    }
  });
};

window.addEventListener("scroll", setActiveLink);
window.addEventListener("load", setActiveLink);

/* BACK TO TOP BUTTON */
window.addEventListener("scroll", () => {
  if (window.scrollY > 600) {
    backToTop.classList.add("visible");
  } else {
    backToTop.classList.remove("visible");
  }
});

/* COUNTDOWN */
const countdownBlock = document.querySelector(".countdown-block");

if (countdownBlock) {
  const weddingDate = new Date(countdownBlock.dataset.weddingDate).getTime();

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (distance % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
  };

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

/* Q&A ACCORDION */
/* SMOOTH Q&A ACCORDION */
const accordionItems = document.querySelectorAll(".accordion-item");

const openAccordion = (item) => {
  const content = item.querySelector(".accordion-content");
  const button = item.querySelector(".accordion-button");

  item.classList.add("active");
  button.setAttribute("aria-expanded", "true");

  content.style.height = `${content.scrollHeight}px`;

  content.addEventListener(
    "transitionend",
    () => {
      if (item.classList.contains("active")) {
        content.style.height = "auto";
      }
    },
    { once: true }
  );
};

const closeAccordion = (item) => {
  const content = item.querySelector(".accordion-content");
  const button = item.querySelector(".accordion-button");

  button.setAttribute("aria-expanded", "false");

  content.style.height = `${content.scrollHeight}px`;

  requestAnimationFrame(() => {
    item.classList.remove("active");
    content.style.height = "0px";
  });
};

accordionItems.forEach((item) => {
  const button = item.querySelector(".accordion-button");
  const content = item.querySelector(".accordion-content");

  button.setAttribute(
    "aria-expanded",
    item.classList.contains("active") ? "true" : "false"
  );

  if (item.classList.contains("active")) {
    content.style.height = "auto";
  } else {
    content.style.height = "0px";
  }

  button.addEventListener("click", () => {
    const isActive = item.classList.contains("active");

    accordionItems.forEach((accordionItem) => {
      if (accordionItem !== item) {
        closeAccordion(accordionItem);
      }
    });

    if (isActive) {
      closeAccordion(item);
    } else {
      openAccordion(item);
    }
  });
});

/* GIFT DETAILS TOGGLE */
/* SMOOTH GIFT DETAILS TOGGLE */
const giftToggle = document.querySelector(".gift-toggle");
const bankDetails = document.querySelector(".bank-details");

if (giftToggle && bankDetails) {
  const openGiftDetails = () => {
    bankDetails.removeAttribute("hidden");
    bankDetails.style.height = "0px";

    requestAnimationFrame(() => {
      bankDetails.classList.add("is-open");
      bankDetails.style.height = `${bankDetails.scrollHeight}px`;
      giftToggle.textContent = "Hide Gift Details";
    });

    bankDetails.addEventListener(
      "transitionend",
      () => {
        if (bankDetails.classList.contains("is-open")) {
          bankDetails.style.height = "auto";
        }
      },
      { once: true }
    );
  };

  const closeGiftDetails = () => {
    bankDetails.style.height = `${bankDetails.scrollHeight}px`;

    requestAnimationFrame(() => {
      bankDetails.classList.remove("is-open");
      bankDetails.style.height = "0px";
      giftToggle.textContent = "Show Gift Details";
    });

    bankDetails.addEventListener(
      "transitionend",
      () => {
        if (!bankDetails.classList.contains("is-open")) {
          bankDetails.setAttribute("hidden", "");
        }
      },
      { once: true }
    );
  };

  giftToggle.addEventListener("click", () => {
    const isOpen = bankDetails.classList.contains("is-open");

    if (isOpen) {
      closeGiftDetails();
    } else {
      openGiftDetails();
    }
  });
}

/* SCROLL REVEAL */
const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
  }
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});

/* RSVP FORM SUBMISSION */
const rsvpForm = document.getElementById("rsvpForm");
const formStatus = document.getElementById("formStatus");

if (rsvpForm && formStatus) {
  rsvpForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = rsvpForm.querySelector(".rsvp-submit");
    const formData = new FormData(rsvpForm);

    submitButton.classList.add("is-loading");
    submitButton.textContent = "Sending...";
    formStatus.textContent = "";
    formStatus.classList.remove("success", "error");

    try {
      const response = await fetch(rsvpForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        rsvpForm.reset();

        formStatus.textContent = "Thank you. Your RSVP has been sent.";
        formStatus.classList.add("success");

        submitButton.textContent = "Submitted";
      } else {
        formStatus.textContent = "Something went wrong. Please try again.";
        formStatus.classList.add("error");

        submitButton.textContent = "Submit RSVP";
      }
    } catch (error) {
      formStatus.textContent = "Connection error. Please try again.";
      formStatus.classList.add("error");

      submitButton.textContent = "Submit RSVP";
    }

    submitButton.classList.remove("is-loading");

    setTimeout(() => {
      if (submitButton.textContent === "Submitted") {
        submitButton.textContent = "Submit RSVP";
      }
    }, 3500);
  });
}