(function () {
  var scene = document.querySelector("[data-art-scene]");
  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduceMotion = motionQuery.matches;

  function revealElements() {
    var elements = document.querySelectorAll(".reveal-on-scroll");

    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach(function (element) {
        element.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    elements.forEach(function (element, index) {
      element.style.transitionDelay = Math.min(index * 60, 240) + "ms";
      observer.observe(element);
    });
  }

  function bindPointerScene() {
    if (!scene || reduceMotion) {
      return;
    }

    var targets = scene.querySelectorAll("[data-depth]");
    var cursorGlow = document.querySelector("[data-cursor-glow]");
    var frame = null;
    var pointer = { x: 0, y: 0 };
    var cursor = { x: 0, y: 0 };

    function update() {
      frame = null;
      targets.forEach(function (target) {
        var depth = Number(target.getAttribute("data-depth")) || 0;
        var x = pointer.x * depth;
        var y = pointer.y * depth;
        target.style.transform = "translate3d(" + x + "px, " + y + "px, 0)";
      });
      if (cursorGlow) {
        cursorGlow.style.opacity = "1";
        cursorGlow.style.transform = "translate3d(" + cursor.x + "px, " + cursor.y + "px, 0) translate3d(-50%, -50%, 0)";
      }
    }

    scene.addEventListener("pointermove", function (event) {
      var rect = scene.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width - 0.5;
      pointer.y = (event.clientY - rect.top) / rect.height - 0.5;
      cursor.x = event.clientX;
      cursor.y = event.clientY;

      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    });

    scene.addEventListener("pointerleave", function () {
      pointer.x = 0;
      pointer.y = 0;
      if (cursorGlow) {
        cursorGlow.style.opacity = "0";
      }
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    });
  }

  revealElements();
  bindPointerScene();
})();
