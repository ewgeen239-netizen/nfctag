// Personal account page: full card editing, live preview and translation corrections.
const form = $("#cabinet-form");
const translationForm = $("#translation-form");
const fieldLimits = {
  job: 80,
  bio: 2000,
  skills: 500,
  services: 1000,
  opportunities: 1000,
  titleAbout: 60,
  titleSkills: 60,
  titleServices: 60,
  titleOpportunities: 60,
  titleContacts: 60,
};
const fieldLabels = {
  job: "Профессия",
  bio: "О себе",
  skills: "Навыки",
  services: "Услуги и предложения",
  opportunities: "Вакансии и проекты",
};
let account = null;
let photo = "";
let saving = false;
let dirty = false;
let editable = { enabled: false, complete: true, languages: {} };
let translationLang = "en";

function markChanged() {
  dirty = true;
  updatePreview();
}
function sectionRow(id, visible, title) {
  const row = node("li", "section-row");
  row.dataset.section = id;
  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.checked = visible;
  toggle.setAttribute("aria-label", "Показывать раздел");
  const input = document.createElement("input");
  input.name = cardTitleFields[id];
  input.maxLength = 60;
  input.value = title;
  input.placeholder = cardSectionTitles[id];
  input.setAttribute("aria-label", "Своё название раздела");
  const move = (label, symbol, action) => {
    const button = node("button", "section-move", symbol);
    button.type = "button";
    button.setAttribute("aria-label", label);
    button.onclick = () => {
      action();
      button.focus();
      markChanged();
    };
    return button;
  };
  row.append(
    toggle,
    node("strong", "section-name", cardSectionTitles[id]),
    input,
    move("Выше", "↑", () => row.previousElementSibling?.before(row)),
    move("Ниже", "↓", () => row.nextElementSibling?.after(row)),
  );
  return row;
}
function sectionsValue() {
  const value = [...$("#section-list").children]
    .map(
      (row) =>
        (row.querySelector("[type=checkbox]").checked ? "" : "!") +
        row.dataset.section,
    )
    .join(",");
  return value === cardSections.join(",") ? "" : value;
}
function draft() {
  return {
    ...Object.fromEntries(new FormData(form)),
    photo,
    sections: sectionsValue(),
    vcard: $("#vcard-toggle").checked ? "" : "off",
  };
}
// Saved translations apply only while the draft keeps the translated source text.
function draftTranslations(profile) {
  const result = {};
  for (const [lang, fields] of Object.entries(editable.languages)) {
    result[lang] = {};
    for (const [field, entry] of Object.entries(fields)) {
      const text = entry.manual || entry.auto;
      if (text && (profile[field] || "").trim() === entry.source)
        result[lang][field] = text;
    }
  }
  return result;
}
function updatePreview() {
  const profile = draft();
  $("#profile-view").replaceChildren(
    renderProfile(localizeProfile(profile, draftTranslations(profile))),
  );
}
function renderPhoto() {
  const thumb = $("#photo-thumb");
  if (photo) {
    const image = node("img", "");
    image.src = photo;
    image.alt = "Фото профиля";
    thumb.replaceChildren(image);
  } else {
    thumb.replaceChildren(
      node("span", "", (form.elements.firstName.value || "N")[0].toUpperCase()),
    );
  }
  $("#photo-remove").hidden = !photo;
}
function fill(profile) {
  form.reset();
  $("#section-list").replaceChildren(
    ...parseSections(profile.sections).map(({ id, visible }) =>
      sectionRow(id, visible, profile[cardTitleFields[id]] || ""),
    ),
  );
  for (const [key, value] of Object.entries(profile)) {
    const field = form.elements.namedItem(key);
    if (field && field.name === key) field.value = value;
  }
  form.elements.accent.value = profile.accent || "lime";
  form.elements.design.value = profile.design || "Лайм";
  $("#vcard-toggle").checked = profile.vcard !== "off";
  photo = profile.photo || "";
  renderPhoto();
  dirty = false;
  updatePreview();
}
function renderTranslationFields() {
  document.querySelectorAll("[data-translation-lang]").forEach((tab) => {
    const active = tab.dataset.translationLang === translationLang;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-pressed", String(active));
  });
  const rows = Object.entries(editable.languages[translationLang] || {}).map(
    ([field, entry]) => {
      const label = node("label", "translation-field");
      const title = node("span", "translation-label");
      const section = Object.keys(cardTitleFields).find(
        (id) => cardTitleFields[id] === field,
      );
      if (section)
        title.append(
          node("span", "", "Заголовок раздела"),
          node("b", "", cardSectionTitles[section]),
        );
      else title.append(node("span", "", fieldLabels[field]));
      const input = node(
        field === "job" || section ? "input" : "textarea",
        "",
      );
      input.name = field;
      input.maxLength = fieldLimits[field];
      input.value = entry.manual || entry.auto;
      input.dataset.auto = entry.auto;
      if (!entry.auto) input.placeholder = "Перевод ещё не готов";
      label.append(
        title,
        personalNode("small", "translation-source", entry.source),
        input,
      );
      return label;
    },
  );
  if (!rows.length)
    rows.push(
      node(
        "p",
        "panel-hint",
        "Заполни тексты визитки, и здесь появятся переводы.",
      ),
    );
  $("#translation-fields").replaceChildren(...rows);
}
async function loadTranslations() {
  try {
    editable = await api("/api/translations");
  } catch (error) {
    $("#translation-state").textContent = accountError(error);
    return;
  }
  $("#translation-state").textContent = !editable.enabled
    ? "Автоперевод не настроен на сервере. Переводы можно заполнить вручную."
    : editable.complete
      ? "Переводы актуальны."
      : "Часть текстов пока не переведена. Попробуй позже.";
  renderTranslationFields();
  updatePreview();
}
async function load() {
  try {
    account = await api("/api/me");
  } catch (error) {
    if (error.message === "unauthorized") location.replace("/?account=1");
    else $("#save-status").textContent = accountError(error);
    return;
  }
  if (!account.profile.firstName) return location.replace("/?account=1");
  $("#account-email").textContent = account.email;
  $("#public-link").value = account.publicUrl;
  $("#open-public").href = account.publicUrl;
  fill(account.profile);
  await loadTranslations();
}

form.addEventListener("input", markChanged);
form.addEventListener("change", markChanged);
form.elements.firstName.addEventListener("input", () => {
  if (!photo) renderPhoto();
});
$("#photo-file").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  readPhoto(file, $("#save-status"), (value) => {
    photo = value;
    renderPhoto();
    markChanged();
  });
  event.target.value = "";
});
$("#photo-remove").onclick = () => {
  photo = "";
  renderPhoto();
  markChanged();
};
form.onsubmit = async (event) => {
  event.preventDefault();
  if (saving) return;
  const button = form.querySelector("[type=submit]");
  saving = true;
  button.disabled = true;
  $("#save-status").textContent = "Сохраняем…";
  try {
    const result = await api("/api/profile", "PUT", draft());
    // Re-read the stored profile: the server normalizes uploaded photos.
    account = await api("/api/me");
    fill(account.profile);
    await loadTranslations();
    $("#save-status").textContent =
      result.translated || !editable.enabled
        ? "Сохранено. Визитка обновлена."
        : "Сохранено. Переводы обновятся позже.";
  } catch (error) {
    $("#save-status").textContent = accountError(error);
  } finally {
    saving = false;
    button.disabled = false;
  }
};
document.querySelectorAll("[data-translation-lang]").forEach((tab) => {
  tab.onclick = () => {
    translationLang = tab.dataset.translationLang;
    $("#translation-status").textContent = "";
    renderTranslationFields();
  };
});
translationForm.onsubmit = async (event) => {
  event.preventDefault();
  const status = $("#translation-status");
  if (dirty) {
    status.textContent = "Сначала сохрани изменения визитки.";
    return;
  }
  const changes = {};
  for (const input of translationForm.querySelectorAll("[name]")) {
    const value = input.value.trim();
    changes[input.name] = value === input.dataset.auto ? "" : value;
  }
  const button = translationForm.querySelector("[type=submit]");
  button.disabled = true;
  status.textContent = "Сохраняем…";
  try {
    await api("/api/translations", "PUT", { [translationLang]: changes });
    await loadTranslations();
    status.textContent = "Переводы сохранены.";
  } catch (error) {
    status.textContent = accountError(error);
  } finally {
    button.disabled = false;
  }
};
$("#copy-link").onclick = () => copyLink($("#public-link"), $("#link-status"));
$("#logout").onclick = async () => {
  try {
    await api("/api/logout", "POST", {});
    dirty = false;
    location.assign("/");
  } catch (error) {
    $("#save-status").textContent = accountError(error);
  }
};
window.addEventListener("beforeunload", (event) => {
  if (dirty) event.preventDefault();
});
document.addEventListener("nfc-language-change", updatePreview);
load();
