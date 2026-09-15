const editor = $("#editor"),
  preview = $("#preview"),
  form = $("#profile-form");
let photo = "",
  selected = "Лайм";
function choose(value) {
  selected = value;
  form.elements.design.value = value;
  document.querySelectorAll("[data-design]").forEach((button) => {
    const active = button.dataset.design === value;
    button.classList.toggle("selected", active);
    button.setAttribute("aria-pressed", String(active));
    button.querySelector(".design-label span").textContent =
      { Лайм: "01", Сирень: "02", Моно: "03" }[button.dataset.design] +
      " / " +
      (active ? "Выбран" : "Выбрать");
  });
}
choose(selected);
document
  .querySelectorAll("[data-editor]")
  .forEach((button) => button.addEventListener("click", () => openAccount()));
document
  .querySelectorAll("[data-design]")
  .forEach((button) =>
    button.addEventListener("click", () => choose(button.dataset.design)),
  );
document
  .querySelectorAll("dialog .close")
  .forEach((button) =>
    button.addEventListener("click", () => button.closest("dialog").close()),
  );
form.elements.design.addEventListener("change", (event) =>
  choose(event.target.value),
);
$("#photo").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  if (!readPhoto(file, $("#save-status"), (value) => (photo = value)))
    event.target.value = "";
});
function draft() {
  return { ...Object.fromEntries(new FormData(form)), photo };
}
form.addEventListener("submit", (event) => saveAccount(event));
const demo = {
  firstName: "Александр",
  lastName: "",
  job: "Дизайнер",
  bio: "Визуальные решения для смелых идей. Люблю знакомиться с людьми, которые создают новое.",
  skills: "Веб-дизайн, Брендинг, UI/UX",
  opportunities: "Открыт к творческим проектам",
  accent: "lime",
};
function showProfile(profile, isDemo = false) {
  $("#profile-view").replaceChildren(renderProfile(profile, isDemo));
  preview.showModal();
}
$("#example").onclick = () => showProfile(demo, true);
$("#preview-draft").onclick = () => showProfile(draft());
let tapTimer;
$("#tap").onclick = () => {
  const button = $("#tap");
  button.disabled = true;
  $(".demo-scene").classList.add("tapping");
  $("#phone-message").textContent = "NFC-карта обнаружена";
  $("#tap-status").textContent = "Открываем пример визитки…";
  clearTimeout(tapTimer);
  tapTimer = setTimeout(() => {
    $("#phone-message").textContent = "Визитка открыта ✓";
    $("#tap-status").textContent =
      "Готово. Так выглядит знакомство по касанию.";
    $(".demo-scene").classList.remove("tapping");
    button.disabled = false;
    showProfile(demo, true);
  }, 1400);
};
