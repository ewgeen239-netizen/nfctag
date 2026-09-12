const $ = (selector) => document.querySelector(selector);
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
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
    file.size > 2 * 1024 * 1024
  ) {
    $("#save-status").textContent =
      "Выбери JPG, PNG или WebP размером до 2 МБ.";
    event.target.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    photo = reader.result;
    $("#save-status").textContent = "Фото добавлено. Сохрани визитку.";
  };
  reader.onerror = () => {
    $("#save-status").textContent =
      "Не удалось прочитать фото. Попробуй другой файл.";
  };
  reader.readAsDataURL(file);
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
function node(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  if (text) element.textContent = text;
  return element;
}
function personalNode(tag, className, text, isDemo) {
  const element = node(tag, className, text);
  if (!isDemo) element.setAttribute("data-user-content", "");
  return element;
}
function safeWebLink(value, hosts) {
  try {
    const url = new URL(value);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return null;
    if (hosts && (url.protocol !== "https:" || !hosts.includes(url.hostname)))
      return null;
    return url.href;
  } catch {
    return null;
  }
}
function contactRow(label, icon, href, onClick) {
  const row = node(href ? "a" : "button", "profile-contact");
  if (href) {
    row.href = href;
    if (href.startsWith("https:") || href.startsWith("http:")) {
      row.target = "_blank";
      row.rel = "noopener noreferrer";
    }
  } else {
    row.type = "button";
    row.onclick = onClick;
  }
  const image = node("img", "contact-icon");
  image.src = "/assets/icons/" + icon + ".svg";
  image.alt = "";
  const arrow = node("span", "contact-arrow", href ? "↗" : "↓");
  arrow.setAttribute("aria-hidden", "true");
  row.append(image, node("span", "contact-label", label), arrow);
  return row;
}
function downloadContact(profile, name) {
  const escape = (value) =>
    String(value || "")
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "FN:" + escape(name),
    "N:" + escape(profile.lastName) + ";" + escape(profile.firstName) + ";;;",
  ];
  if (profile.job) lines.push("TITLE:" + escape(profile.job));
  if (profile.phone) lines.push("TEL:" + escape(profile.phone));
  if (profile.contactEmail) lines.push("EMAIL:" + escape(profile.contactEmail));
  if (safeWebLink(profile.social)) lines.push("URL:" + escape(profile.social));
  lines.push("END:VCARD");
  const url = URL.createObjectURL(
    new Blob([lines.join("\r\n")], { type: "text/vcard;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "contact.vcf";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function renderProfile(profile) {
  const isDemo = profile === demo;
  const card = node(
    "article",
    "digital-card accent-" +
      (["lime", "lilac", "silver"].includes(profile.accent)
        ? profile.accent
        : "lime"),
  );
  const name =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    "Твоё имя";
  const portrait = node(
    "div",
    "profile-portrait" + (profile.photo ? "" : " portrait-empty"),
  );
  if (profile.photo) {
    const image = node("img", "profile-photo");
    image.src = profile.photo;
    image.alt = "Фото профиля";
    portrait.append(image);
  } else {
    const initials =
      [profile.firstName, profile.lastName]
        .filter(Boolean)
        .map((part) => part[0])
        .join("") || "N";
    const monogram = node("div", "profile-monogram", initials.toUpperCase());
    monogram.setAttribute("aria-hidden", "true");
    portrait.append(monogram);
  }
  const identity = node("div", "profile-identity");
  identity.append(personalNode("h1", "profile-name", name, isDemo));
  if (profile.job)
    identity.append(personalNode("p", "profile-job", profile.job, isDemo));
  portrait.append(identity);
  card.append(portrait);
  const content = node("div", "profile-content");
  function section(title, value) {
    if (!value || !value.trim()) return;
    const block = node("section", "profile-section");
    block.append(
      node("h2", "profile-section-title", title),
      personalNode("p", "profile-body", value, isDemo),
    );
    content.append(block);
  }
  section("Обо мне", profile.bio);
  const skills = (profile.skills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
  if (skills.length) {
    const block = node("section", "profile-section");
    const tags = node("div", "profile-skills");
    skills.forEach((skill) =>
      tags.append(personalNode("span", "profile-skill", skill, isDemo)),
    );
    block.append(node("h2", "profile-section-title", "Навыки"), tags);
    content.append(block);
  }
  section("Услуги и предложения", profile.services);
  section("Вакансии и проекты", profile.opportunities);
  const contacts = node("section", "profile-section profile-contacts");
  contacts.append(node("h2", "profile-section-title", "Связаться"));
  if (profile.phone && /\d/.test(profile.phone))
    contacts.append(
      contactRow(
        "Телефон",
        "phone",
        "tel:" + profile.phone.replace(/[^+\d]/g, ""),
      ),
    );
  for (const [field, label, icon, hosts] of [
    [
      "instagram",
      "Instagram",
      "brand-instagram",
      ["instagram.com", "www.instagram.com"],
    ],
    [
      "telegram",
      "Telegram",
      "brand-telegram",
      ["t.me", "telegram.me", "www.t.me", "www.telegram.me"],
    ],
  ]) {
    const url = safeWebLink(profile[field], hosts);
    if (url) contacts.append(contactRow(label, icon, url));
  }
  const whatsapp = (profile.whatsapp || "").replace(/[\s()+.-]/g, "");
  if (/^[1-9]\d{6,14}$/.test(whatsapp))
    contacts.append(
      contactRow("WhatsApp", "brand-whatsapp", "https://wa.me/" + whatsapp),
    );
  if (
    profile.contactEmail &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.contactEmail)
  )
    contacts.append(
      contactRow("Email", "mail", "mailto:" + profile.contactEmail),
    );
  const website = safeWebLink(profile.social);
  if (website)
    contacts.append(contactRow("Сайт / портфолио", "world", website));
  contacts.append(
    contactRow("Сохранить контакт", "user-plus", null, () =>
      downloadContact(profile, name),
    ),
  );
  content.append(contacts);
  card.append(content, node("div", "profile-signature", "NFC )))"));
  return card;
}
function showProfile(profile) {
  $("#profile-view").replaceChildren(renderProfile(profile));
  preview.showModal();
}
$("#example").onclick = () => showProfile(demo);
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
    showProfile(demo);
  }, 1400);
};
