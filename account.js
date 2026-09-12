let currentAccount = null;
let authMode = "login";
let saving = false;
const auth = $("#auth");
const complete = $("#save-complete");

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
function setAccount(account) {
  currentAccount = account;
  document.querySelectorAll("[data-account-label]").forEach((label) => {
    label.textContent = account ? "Личный кабинет" : "Войти";
  });
}
const accountReady = api("/api/me")
  .then((account) => {
    setAccount(account);
  })
  .catch((error) => {
    if (error.message === "unauthorized") setAccount(null);
  });

async function openAccount() {
  await accountReady;
  try {
    const account = await api("/api/me");
    setAccount(account);
    loadAccount();
    if (!editor.open) editor.showModal();
  } catch (error) {
    if (error.message === "unauthorized") setAccount(null);
    else $("#auth-status").textContent = accountError(error);
    if (error.message === "storage_unavailable") {
      $("#auth-form").hidden = true;
      auth.querySelector(".notice").textContent = accountError(error);
    }
    if (!auth.open) auth.showModal();
  }
}
function loadAccount() {
  form.reset();
  for (const [key, value] of Object.entries(currentAccount.profile)) {
    if (form.elements[key]) form.elements[key].value = value;
  }
  form.elements.accent.value = currentAccount.profile.accent || "lime";
  photo = currentAccount.profile.photo || "";
  choose(currentAccount.profile.design || "Лайм");
  $("#public-link").value = currentAccount.publicUrl;
  $("#open-public").href = currentAccount.publicUrl;
  $("#account-email").textContent = currentAccount.email;
  $("#save-status").textContent = "";
}
$("#auth-toggle").onclick = () => {
  authMode = authMode === "login" ? "register" : "login";
  $("#auth-title").textContent =
    authMode === "login" ? "Войти в кабинет" : "Создать аккаунт";
  $("#auth-submit").textContent =
    authMode === "login" ? "Войти" : "Зарегистрироваться";
  $("#auth-toggle").textContent =
    authMode === "login"
      ? "Нет аккаунта? Регистрация"
      : "Уже есть аккаунт? Войти";
  $("#auth-password").autocomplete =
    authMode === "login" ? "current-password" : "new-password";
  $("#auth-status").textContent = "";
};
$("#auth-form").onsubmit = async (event) => {
  event.preventDefault();
  const button = $("#auth-submit");
  button.disabled = true;
  $("#auth-status").textContent = "Подождите…";
  try {
    await accountReady;
    await api("/api/" + authMode, "POST", {
      email: $("#auth-email").value,
      password: $("#auth-password").value,
    });
    $("#auth-password").value = "";
    setAccount(await api("/api/me"));
    auth.close();
    loadAccount();
    if (!editor.open) editor.showModal();
  } catch (error) {
    $("#auth-status").textContent = accountError(error);
  } finally {
    button.disabled = false;
  }
};
$("#logout").onclick = async () => {
  try {
    await api("/api/logout", "POST", {});
    setAccount(null);
    form.reset();
    photo = "";
    editor.close();
  } catch (error) {
    $("#save-status").textContent = accountError(error);
  }
};
async function copyLink(input, status) {
  try {
    await navigator.clipboard.writeText(input.value);
    status.textContent = "Ссылка скопирована.";
  } catch {
    input.select();
    status.textContent = "Выделенная ссылка готова к копированию.";
  }
}
$("#copy-link").onclick = () => copyLink($("#public-link"), $("#link-status"));
$("#complete-copy").onclick = () =>
  copyLink($("#complete-link"), $("#complete-status"));
$("#complete-account").onclick = () => {
  complete.close();
  // The saved form is still intact. No onboarding reset or redundant network read.
  editor.showModal();
};
editor.addEventListener("cancel", (event) => {
  if (saving) event.preventDefault();
});
async function saveAccount(event) {
  event.preventDefault();
  if (saving) return;
  const profile = draft();
  const controls = [...editor.querySelectorAll("input,textarea,select,button")];
  const disabled = controls.map((control) => control.disabled);
  saving = true;
  controls.forEach((control) => (control.disabled = true));
  $("#save-status").textContent = "Сохраняем…";
  try {
    await api("/api/profile", "PUT", profile);
    currentAccount.profile = profile;
    $("#complete-link").value = currentAccount.publicUrl;
    $("#complete-status").textContent = "";
    $("#save-status").textContent = "";
    editor.close();
    complete.showModal();
  } catch (error) {
    if (error.message === "unauthorized") {
      setAccount(null);
      // Keep the editor and its values; signing in must not be treated as a save.
    }
    $("#save-status").textContent = accountError(error);
  } finally {
    saving = false;
    controls.forEach((control, index) => (control.disabled = disabled[index]));
  }
}
const publicMatch = location.pathname.match(/^\/p\/([A-Za-z0-9_-]+)$/);
if (publicMatch) {
  document.body.classList.add("public-page");
  $("#landing").hidden = true;
  document.querySelector(".header nav").hidden = true;
  const publicView = node("main", "public-card-host");
  document.body.append(publicView);
  api("/api/public/" + publicMatch[1])
    .then((data) => {
      publicView.append(renderProfile(data.profile));
    })
    .catch(() => {
      publicView.append(
        node("p", "public-error", "Визитка не найдена или сервер недоступен."),
      );
    });
}
if (new URLSearchParams(location.search).get("account") === "1") {
  history.replaceState(null, "", location.pathname);
  openAccount();
}
