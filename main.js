/* main.js — contact form validation and submit handler

  Behavior
  - validates name, email, phone and message client-side
  - sends the form to a configured endpoint (Formspree) using fetch
  - if no endpoint is configured, falls back to opening the user's mail client via mailto

  IMPORTANT: To receive emails directly to uwamariyaassumpta24@gmail.com, create a free/formspree account
  and set up a form. Replace the value of the `data-endpoint` attribute on the <form> with the
  Formspree endpoint URL (e.g. https://formspree.io/f/abcd1234). Formspree will forward submitted
  messages to the email address you configure for the form.
*/

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");

  // --- scroll-to-top control: run regardless of whether the contact form exists ---
  (function setupTopScroller() {
    const topEl = document.querySelector(".top");
    if (!topEl) return;
    // make interactive / accessible
    topEl.setAttribute("role", "button");
    topEl.setAttribute("tabindex", "0");
    topEl.style.cursor = "pointer";

    const doScrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    topEl.addEventListener("click", doScrollTop);
    topEl.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        doScrollTop();
      }
    });
  })();

  if (!form) return;

  /* Mobile menu toggle: accessible and closes on link click or ESC/resize */
  (function setupNavToggle() {
    const nav = document.querySelector(".nav");
    const toggle = document.querySelector(".menu-toggle");
    if (!nav || !toggle) return;

    const panel = nav.querySelector("#nav-links");

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("open", open);
      if (!open) toggle.focus();
    }

    toggle.addEventListener("click", () =>
      setOpen(!nav.classList.contains("open"))
    );

    // close when nav link clicked (single page internal links)
    if (panel) {
      panel.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", () => setOpen(false));
      });
    }

    // close with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) setOpen(false);
    });

    // if user resizes to desktop size, make sure menu is closed
    window.addEventListener("resize", () => {
      if (window.innerWidth > 820 && nav.classList.contains("open"))
        setOpen(false);
    });
  })();

  const feedbackEl = document.getElementById("contact-feedback");
  const submitBtn = form.querySelector('button[type="submit"]');
  // helper to show an alert message as a second visual confirmation
  function showAlert(message, type = "info") {
    // keep it simple and use native alert (non-blocking UX is fine for small sites)
    try {
      if (type === "error") window.alert("Error: " + message);
      else if (type === "success") window.alert("Success: " + message);
      else window.alert(message);
    } catch (e) {
      // if window.alert is not available (unlikely), ignore
      console.warn("showAlert fallback:", message, e);
    }
  }

  const ENDPOINT = form.dataset.endpoint || ""; // configured in HTML

  function showFeedback(message, type = "error") {
    feedbackEl.innerHTML = "";
    const div = document.createElement("div");
    div.className = type === "success" ? "success" : "error";
    div.textContent = message;
    feedbackEl.appendChild(div);
  }

  function clearFeedback() {
    feedbackEl.innerHTML = "";
  }

  function markFieldError(field, error = true) {
    if (!field) return;
    if (error) field.classList.add("input-error");
    else field.classList.remove("input-error");
  }

  function validate() {
    clearFeedback();
    const name = (form.querySelector("#name")?.value || "").trim();
    const email = (form.querySelector("#email")?.value || "").trim();
    const phone = (form.querySelector("#phone")?.value || "").trim();
    const message = (form.querySelector("#message")?.value || "").trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+\d\s()-.]{7,20}$/; // permissive international format

    let errors = [];

    // name
    if (!name || name.length < 2) {
      errors.push("Please enter your full name (at least 2 characters).");
      markFieldError(form.querySelector("#name"), true);
    } else markFieldError(form.querySelector("#name"), false);

    // email
    if (!email || !emailRegex.test(email)) {
      errors.push("Please enter a valid email address.");
      markFieldError(form.querySelector("#email"), true);
    } else markFieldError(form.querySelector("#email"), false);

    // phone
    if (!phone || !phoneRegex.test(phone)) {
      errors.push(
        "Please enter a valid phone number (digits, spaces and + are allowed)."
      );
      markFieldError(form.querySelector("#phone"), true);
    } else markFieldError(form.querySelector("#phone"), false);

    // message
    if (!message || message.length < 10) {
      errors.push("Please write a message with at least 10 characters.");
      markFieldError(form.querySelector("#message"), true);
    } else markFieldError(form.querySelector("#message"), false);

    return { ok: errors.length === 0, errors };
  }

  async function sendToEndpoint(formData, endpoint) {
    // Formspree accepts POST with FormData fine and returns JSON
    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      if (resp.ok) return { ok: true };
      // try to parse JSON message
      let data = {};
      try {
        data = await resp.json();
      } catch (e) {}
      return {
        ok: false,
        status: resp.status,
        error: data.error || data.message || resp.statusText,
      };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }

  form.addEventListener("submit", async function (ev) {
    ev.preventDefault();
    clearFeedback();

    const result = validate();
    if (!result.ok) {
      showFeedback(result.errors.join("\n"), "error");
      return;
    }

    // Build FormData
    const formData = new FormData(form);

    // disable UI
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Sending...";

    // prefer configured endpoint if present
    if (ENDPOINT && ENDPOINT.indexOf("YOUR_FORM_ID") === -1) {
      const res = await sendToEndpoint(formData, ENDPOINT);
      if (res.ok) {
        showFeedback("Thank you,form submitted sucessfully!");
        showAlert("Your message has been sent successfully!", "success");
        form.reset();
      } else {
        const errMsg = res.error || "Unknown server error";
        showFeedback("Sending failed: " + errMsg, "error");
        showAlert("Sending failed: " + errMsg, "error");
      }
    } else {
      // no endpoint configured — show a local success message (demo mode)
      // This avoids trying to open an email client. The form will reset and
      // show a confirmation to the user.
      const demoMsg = "Thank you Sucessfully submitted.";
      showFeedback(demoMsg, "success");
      showAlert(demoMsg, "success");
      form.reset();
    }

    // restore UI
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  });
});
