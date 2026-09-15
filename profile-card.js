// Shared by the landing page, public cards and the personal account: API helpers and the card renderer.
const $ = (selector) => document.querySelector(selector);
async function api(path, method = "GET", body) {
  const response = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "network");
  return data;
}
const accountErrors = {
  storage_unavailable: "Кабинет временно недоступен. Попробуй позже.",
  rate_limited: "Слишком много попыток. Попробуй через 15 минут.",
  credentials: "Неверный email или пароль.",
  credentials_format: "Введи email и пароль от 10 до 128 символов.",
  exists: "Этот email уже зарегистрирован.",
  unauthorized: "Войди снова, чтобы сохранить изменения.",
  name_required: "Укажи имя",
  invalid: "Проверь поля формы.",
  contacts_invalid:
    "Проверь ссылки Instagram и Telegram, email и номер WhatsApp с кодом страны.",
  too_large: "Файл слишком большой.",
  origin: "Запрос отклонён. Обнови страницу.",
};
function accountError(error) {
  return (
    accountErrors[error.message] ||
    "Не удалось выполнить запрос. Проверь соединение и попробуй снова."
  );
}
async function copyLink(input, status) {
  try {
    await navigator.clipboard.writeText(input.value);
    status.textContent = "Ссылка скопирована.";
  } catch {
    input.select();
    status.textContent = "Выделенная ссылка готова к копированию.";
  }
}
// Photo picker shared by the first-card editor and the account page.
function readPhoto(file, status, onLoad) {
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
    file.size > 2 * 1024 * 1024
  ) {
    status.textContent = "Выбери JPG, PNG или WebP размером до 2 МБ.";
    return false;
  }
  const reader = new FileReader();
  reader.onload = () => {
    onLoad(reader.result);
    status.textContent = "Фото добавлено. Сохрани визитку.";
  };
  reader.onerror = () => {
    status.textContent = "Не удалось прочитать фото. Попробуй другой файл.";
  };
  reader.readAsDataURL(file);
  return true;
}
const cardSections = ["about", "skills", "services", "opportunities", "contacts"];
const cardSectionTitles = {
  about: "Обо мне",
  skills: "Навыки",
  services: "Услуги и предложения",
  opportunities: "Вакансии и проекты",
  contacts: "Связаться",
};
const cardTitleFields = {
  about: "titleAbout",
  skills: "titleSkills",
  services: "titleServices",
  opportunities: "titleOpportunities",
  contacts: "titleContacts",
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
// "about,!skills,..." -> ordered [{id, visible}]; empty or unknown values use the default layout.
function parseSections(value) {
  const result = [];
  for (const token of (value || "").split(",")) {
    const id = token.replace(/^!/, "");
    if (cardSections.includes(id) && !result.some((item) => item.id === id))
      result.push({ id, visible: !token.startsWith("!") });
  }
  for (const id of cardSections)
    if (!result.some((item) => item.id === id))
      result.push({ id, visible: true });
  return result;
}
// Merge the saved translation for the current interface language over the original text.
function localizeProfile(profile, translations) {
  const language = document.documentElement.lang || "ru";
  return { ...profile, ...((translations || {})[language] || {}) };
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
function renderProfile(profile, isDemo = false) {
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
  function heading(id) {
    const custom = (profile[cardTitleFields[id]] || "").trim();
    return custom
      ? personalNode("h2", "profile-section-title", custom, isDemo)
      : node("h2", "profile-section-title", cardSectionTitles[id]);
  }
  function textSection(id, value) {
    if (!value || !value.trim()) return;
    const block = node("section", "profile-section");
    block.append(heading(id), personalNode("p", "profile-body", value, isDemo));
    content.append(block);
  }
  function skillsSection() {
    const skills = (profile.skills || "")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
    if (!skills.length) return;
    const block = node("section", "profile-section");
    const tags = node("div", "profile-skills");
    skills.forEach((skill) =>
      tags.append(personalNode("span", "profile-skill", skill, isDemo)),
    );
    block.append(heading("skills"), tags);
    content.append(block);
  }
  function contactsSection() {
    const contacts = node("section", "profile-section profile-contacts");
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
    if (profile.vcard !== "off")
      contacts.append(
        contactRow("Сохранить контакт", "user-plus", null, () =>
          downloadContact(profile, name),
        ),
      );
    if (!contacts.children.length) return;
    contacts.prepend(heading("contacts"));
    content.append(contacts);
  }
  for (const { id, visible } of parseSections(profile.sections)) {
    if (!visible) continue;
    if (id === "skills") skillsSection();
    else if (id === "contacts") contactsSection();
    else textSection(id, profile[{ about: "bio" }[id] || id]);
  }
  card.append(content, node("div", "profile-signature", "NFC )))"));
  return card;
}
