(function () {
  "use strict";

  var toggleBtn = document.getElementById("toggle-presentation");
  var navLinks = document.querySelectorAll("#top-nav a");
  var sections = [];

  navLinks.forEach(function (link) {
    var href = link.getAttribute("href");
    if (href && href.charAt(0) === "#") {
      var section = document.querySelector(href);
      if (section) {
        sections.push({ id: href, el: section, link: link });
      }
    }
  });

  /* Presentation mode toggle */
  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      var active = document.body.classList.toggle("presentation-mode");
      toggleBtn.setAttribute("aria-pressed", active ? "true" : "false");
      toggleBtn.textContent = active ? "Scroll View" : "Presentation";
    });
  }

  /* Smooth scroll for in-page nav (fallback for browsers without CSS smooth) */
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href");
      if (!href || href.charAt(0) !== "#") return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", href);
    });
  });

  /* Active nav highlight on scroll */
  function updateActiveNav() {
    var scrollY = window.scrollY + 120;
    var current = sections[0];

    sections.forEach(function (item) {
      if (item.el.offsetTop <= scrollY) {
        current = item;
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove("active");
    });

    if (current && current.link) {
      current.link.classList.add("active");
    }
  }

  /* Keyboard navigation in presentation mode */
  document.addEventListener("keydown", function (e) {
    if (!document.body.classList.contains("presentation-mode")) return;
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "PageDown" && e.key !== "PageUp") return;

    e.preventDefault();
    var idx = sections.findIndex(function (item) {
      return item.link.classList.contains("active");
    });
    if (idx < 0) idx = 0;

    var next = idx;
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      next = Math.min(idx + 1, sections.length - 1);
    } else {
      next = Math.max(idx - 1, 0);
    }

    sections[next].el.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();
})();
