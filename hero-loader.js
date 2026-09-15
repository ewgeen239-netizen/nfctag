// Real footage in the hero; the 3D scene loads only if the video cannot play.
// Nothing downloads until the hero approaches the viewport; public profiles load neither.
if (!location.pathname.startsWith("/p/")) {
  const host = document.querySelector("#hero-scene");
  const video = host.querySelector("video");
  const toggle = document.querySelector("#scene-toggle");
  const status = document.querySelector("#scene-status");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let userPaused = false;
  let onScreen = false;

  function label() {
    toggle.textContent = video.paused
      ? userPaused
        ? "Продолжить"
        : "Воспроизвести"
      : "Пауза";
    toggle.setAttribute("aria-pressed", String(video.paused));
  }
  function sync() {
    if (onScreen && !userPaused && !reduced.matches)
      video.play().catch(label);
    else video.pause();
  }
  function fallback() {
    host.classList.remove("video-active");
    video.remove();
    import("/hero-scene.js").catch(() => {
      host.classList.add("scene-unavailable");
      status.textContent =
        "3D недоступно. Посмотри интерактивный пример визитки.";
      toggle.hidden = true;
    });
  }
  const observer = new IntersectionObserver(
    (entries) => {
      onScreen = entries.some((entry) => entry.isIntersecting);
      if (!video.src && onScreen) {
        video.addEventListener("error", fallback, { once: true });
        video.src = matchMedia("(max-width: 767px)").matches
          ? "/assets/video/hero-tap-540.mp4"
          : "/assets/video/hero-tap-720.mp4";
        host.classList.add("video-active");
        status.textContent = "Без приложения";
      }
      if (video.isConnected) sync();
    },
    { rootMargin: "200px" },
  );
  observer.observe(host);
  video.addEventListener("play", label);
  video.addEventListener("pause", label);
  toggle.onclick = () => {
    if (!video.isConnected) return;
    userPaused = !video.paused;
    if (video.paused) video.play().catch(label);
    else video.pause();
  };
  reduced.addEventListener("change", sync);
  // Browsers pause media in hidden tabs; resume when the visitor returns.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && video.isConnected) sync();
  });
  document.addEventListener("nfc-language-change", label);
  label();
}
