// Keep Three.js off public profiles and defer its download until the hero is near the viewport.
if (!location.pathname.startsWith("/p/")) {
  const host = document.querySelector("#hero-scene");
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      import("/hero-scene.js").catch(() => {
        host.classList.add("scene-unavailable");
        document.querySelector("#scene-status").textContent =
          "3D недоступно. Посмотри интерактивный пример визитки.";
        document.querySelector("#scene-toggle").hidden = true;
      });
    },
    { rootMargin: "200px" },
  );
  observer.observe(host);
}
