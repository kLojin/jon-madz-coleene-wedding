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

/* SMOOTH Q&A ACCORDION */
const accordionItems = document.querySelectorAll(".accordion-item");

accordionItems.forEach((item) => {
  const button = item.querySelector(".accordion-button");

  button.addEventListener("click", () => {
    const isActive = item.classList.contains("active");

    accordionItems.forEach((accordionItem) => {
      if (accordionItem !== item) {
        accordionItem.classList.remove("active");
        accordionItem
          .querySelector(".accordion-button")
          .setAttribute("aria-expanded", "false");
      }
    });

    item.classList.toggle("active", !isActive);
    button.setAttribute("aria-expanded", String(!isActive));
  });
});

/* PROGRESSIVE RSVP FIELDS */
const attendanceSelect = document.getElementById("attendanceSelect");
const rsvpFollowUp = document.getElementById("rsvpFollowUp");
const guestCount = document.getElementById("guestCount");

if (attendanceSelect && rsvpFollowUp && guestCount) {
  const followUpFields = rsvpFollowUp.querySelectorAll("input, textarea, select");
  const attendingOnlyFields = rsvpFollowUp.querySelectorAll(".attending-only-field");
  const progressiveRsvpForm = document.getElementById("rsvpForm");

  const updateRsvpFields = () => {
    const hasSelectedAttendance = attendanceSelect.value !== "";
    const isAttending = attendanceSelect.value === "Yes, I will attend";

    rsvpFollowUp.classList.toggle("is-visible", hasSelectedAttendance);
    rsvpFollowUp.setAttribute("aria-hidden", String(!hasSelectedAttendance));
    rsvpFollowUp.inert = !hasSelectedAttendance;
    followUpFields.forEach((field) => {
      field.disabled = !hasSelectedAttendance;
    });
    attendingOnlyFields.forEach((field) => {
      field.hidden = !isAttending;
      field.querySelectorAll("input, textarea, select").forEach((input) => {
        input.disabled = !isAttending;
      });
    });
    guestCount.required = isAttending;

    if (!isAttending) {
      guestCount.value = "";
    }
  };

  attendanceSelect.addEventListener("change", updateRsvpFields);
  progressiveRsvpForm?.addEventListener("reset", () => {
    requestAnimationFrame(updateRsvpFields);
  });
  updateRsvpFields();
}

/* SMOOTH GIFT DETAILS TOGGLE */
const giftToggle = document.querySelector(".gift-toggle");
const bankDetails = document.querySelector(".bank-details");

if (giftToggle && bankDetails) {
  giftToggle.addEventListener("click", () => {
    const willOpen = !bankDetails.classList.contains("is-open");

    bankDetails.classList.toggle("is-open", willOpen);
    bankDetails.setAttribute("aria-hidden", String(!willOpen));
    giftToggle.setAttribute("aria-expanded", String(willOpen));
    giftToggle.textContent = willOpen ? "Hide Gift Details" : "Show Gift Details";
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
const RSVP_SUPABASE_URL = "https://icwvatphuyjqvdowriss.supabase.co";
const RSVP_SUPABASE_ANON_KEY = "sb_publishable_u-yjZ2caskNqkUbvkgMNTw_MHuWrpBv";
const rsvpSupabase = window.supabase?.createClient(
  RSVP_SUPABASE_URL,
  RSVP_SUPABASE_ANON_KEY
);

if (rsvpForm && formStatus) {
  rsvpForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = rsvpForm.querySelector(".rsvp-submit");
    const formData = new FormData(rsvpForm);

    if (!rsvpForm.checkValidity()) {
      rsvpForm.reportValidity();
      return;
    }

    if (!rsvpSupabase) {
      formStatus.textContent = "RSVP service is unavailable. Please try again.";
      formStatus.classList.add("error");
      return;
    }

    const isAttending = formData.get("Attendance") === "Yes, I will attend";
    const guestCountValue = formData.get("Number of Guests");
    const submission = {
      full_name: String(formData.get("Full Name") || "").trim(),
      attendance: String(formData.get("Attendance") || ""),
      guest_count: isAttending && guestCountValue ? Number(guestCountValue) : null,
      contact_number: isAttending
        ? String(formData.get("Contact Number") || "").trim() || null
        : null,
      message: String(formData.get("Message") || "").trim() || null,
      website: String(formData.get("Website") || "").trim(),
    };

    submitButton.classList.add("is-loading");
    submitButton.textContent = "Sending...";
    formStatus.textContent = "";
    formStatus.classList.remove("success", "error");

    try {
      const { data, error } = await rsvpSupabase.functions.invoke("submit-rsvp", {
        body: submission,
      });

      if (!error && data?.success) {
        rsvpForm.reset();

        formStatus.textContent = "Thank you. Your RSVP has been sent.";
        formStatus.classList.add("success");

        submitButton.textContent = "Submitted";
      } else {
        console.error("RSVP submission failed:", error?.message || data?.error);
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

/* HOME VIDEO SOUND TOGGLE */
const homeHeroVideo = document.getElementById("homeHeroVideo");
const musicToggle = document.getElementById("musicToggle");

if (homeHeroVideo && musicToggle) {
  const musicLabel = musicToggle.querySelector(".music-toggle-label");

  const syncMusicToggle = () => {
    const isPlayingWithSound = !homeHeroVideo.muted && !homeHeroVideo.paused;

    musicToggle.setAttribute("aria-pressed", String(isPlayingWithSound));
    musicToggle.setAttribute(
      "aria-label",
      isPlayingWithSound ? "Turn video sound off" : "Turn video sound on"
    );
    musicLabel.textContent = isPlayingWithSound ? "Music On" : "Music Off";
  };

  musicToggle.addEventListener("click", async () => {
    if (homeHeroVideo.muted) {
      homeHeroVideo.muted = false;

      try {
        await homeHeroVideo.play();
      } catch (error) {
        homeHeroVideo.muted = true;
      }
    } else {
      homeHeroVideo.muted = true;
    }

    syncMusicToggle();
  });

  homeHeroVideo.addEventListener("volumechange", syncMusicToggle);
  homeHeroVideo.addEventListener("pause", syncMusicToggle);
  homeHeroVideo.addEventListener("play", syncMusicToggle);
  syncMusicToggle();
}
