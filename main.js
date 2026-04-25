document.addEventListener("DOMContentLoaded", function () {
  // ── Mouse-Follow Effect for Orbs ──
  const orbs = document.querySelectorAll('.orb');
  document.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    orbs.forEach((orb, index) => {
      const speed = (index + 1) * 0.02;
      const x = (clientX - centerX) * speed;
      const y = (clientY - centerY) * speed;
      orb.style.transform = `translate(${x}px, ${y}px)`;
    });
  });

  // ── Scroll Reveal Animation ──
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // ── Back to top ──
  const topEl = document.querySelector(".top");
  if (topEl) {
    const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
    topEl.addEventListener("click", scrollTop);
    
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        topEl.classList.add("visible");
      } else {
        topEl.classList.remove("visible");
      }
    });
  }

  // ── Navbar scrolled class ──
  const header = document.querySelector(".navbar");
  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    });
  }

  // ── Mobile nav toggle ──
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
  }

  // ── EmailJS config ──
  const EMAILJS_PUBLIC_KEY  = "2aEJq8nO2LJJ7uxdN";
  const EMAILJS_SERVICE_ID  = "service_9w0oiim";
  const EMAILJS_TEMPLATE_ID = "template_xfz11qk";

  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  // ── Contact form ──
  const form = document.getElementById("contact-form");
  if (form) {
    const feedbackEl = document.getElementById("contact-feedback");
    const submitBtn  = form.querySelector('button[type="submit"]');

    function showFeedback(msg, type = "error") {
      const div = document.createElement("div");
      div.className = type;
      div.textContent = msg;
      feedbackEl.innerHTML = "";
      feedbackEl.appendChild(div);
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      feedbackEl.innerHTML = "";
      
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";

      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          from_name: form.querySelector("#name").value.trim(),
          from_email: form.querySelector("#email").value.trim(),
          phone:      form.querySelector("#phone").value.trim(),
          message:    form.querySelector("#message").value.trim(),
        });
        showFeedback("Thank you! Your message has been sent successfully.", "success");
        form.reset();
      } catch (err) {
        showFeedback("Failed to send message. Please try again.", "error");
      }

      submitBtn.disabled = false;
      submitBtn.textContent = "Send Message";
    });
  }
});
