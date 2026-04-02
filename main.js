document.addEventListener("DOMContentLoaded", function () {
  // ── Back to top ──────────────────────────────────────────
  const topEl = document.querySelector(".top");
  if (topEl) {
    const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
    topEl.addEventListener("click", scrollTop);
    topEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); scrollTop(); }
    });
  }

  // ── Mobile nav toggle ────────────────────────────────────
  const nav    = document.querySelector(".nav");
  const toggle = document.querySelector(".menu-toggle");
  const panel  = document.querySelector("#nav-links");
  if (nav && toggle) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("open", open);
      if (panel) panel.classList.toggle("show", open);
    };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
    if (panel) panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    window.addEventListener("resize", () => { if (window.innerWidth > 820) setOpen(false); });
  }

  // ── Contact form ─────────────────────────────────────────
  const form       = document.getElementById("contact-form");
  const feedbackEl = document.getElementById("contact-feedback");
  const submitBtn  = form && form.querySelector('button[type="submit"]');
  if (!form) return;

  function showFeedback(msg, type = "error") {
    const div = document.createElement("div");
    div.className = type;
    div.textContent = msg;
    feedbackEl.innerHTML = "";
    feedbackEl.appendChild(div);
  }

  function validate() {
    const name    = form.querySelector("#name").value.trim();
    const email   = form.querySelector("#email").value.trim();
    const phone   = form.querySelector("#phone").value.trim();
    const message = form.querySelector("#message").value.trim();
    const errors  = [];

    [["#name", name.length >= 2, "Please enter your full name."],
     ["#email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), "Please enter a valid email."],
     ["#phone", /^[+\d\s()-.]{7,20}$/.test(phone), "Please enter a valid phone number."],
     ["#message", message.length >= 10, "Message must be at least 10 characters."]
    ].forEach(([sel, ok, msg]) => {
      const el = form.querySelector(sel);
      el.classList.toggle("input-error", !ok);
      if (!ok) errors.push(msg);
    });

    return errors;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    feedbackEl.innerHTML = "";

    const errors = validate();
    if (errors.length) { showFeedback(errors.join(" "), "error"); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    try {
      const res = await fetch("http://localhost:3001/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:    form.querySelector("#name").value.trim(),
          email:   form.querySelector("#email").value.trim(),
          phone:   form.querySelector("#phone").value.trim(),
          message: form.querySelector("#message").value.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback("Thank you! Your message has been sent successfully.", "success");
        form.reset();
      } else {
        showFeedback(data.error || "Something went wrong. Please try again.", "error");
      }
    } catch {
      showFeedback("Could not reach the server. Please try again later.", "error");
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Send Message";
  });
});
