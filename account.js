let currentAccount = null;
let authMode = "login";
let saving = false;
const auth = $("#auth");
const complete = $("#save-complete");
const accountPath = "/account";

function setAccount(account) {
  currentAccount = account;
  document.querySelectorAll("[data-account-label]").forEach((label) => {
    label.textContent = account ? "Личный кабинет" : "Войти";
  });
}
// The first card is created in the editor dialog; afterwards the account is a separate page.
function hasCard(account) {
  return Boolean(account && account.profile.firstName);
}
const accountReady = api("/api/me")
  .then((account) => {
    setAccount(account);
  })
  .catch((error) => {
    if (error.message === "unauthorized") setAccount(null);
  });

function enterAccount() {
  if (hasCard(currentAccount)) {
    location.assign(accountPath);
    return;
  }
  loadAccount();
  if (!editor.open) editor.showModal();
}
async function openAccount() {
  await accountReady;
  try {
    setAccount(await api("/api/me"));
    enterAccount();
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
    if (key !== "photo" && form.elements[key]) form.elements[key].value = value;
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
    enterAccount();
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
$("#copy-link").onclick = () => copyLink($("#public-link"), $("#link-status"));
$("#complete-copy").onclick = () =>
  copyLink($("#complete-link"), $("#complete-status"));
$("#complete-account").onclick = () => location.assign(accountPath);
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
      // Visitors see the card in the site language: browser default or their choice.
      const render = () =>
        publicView.replaceChildren(
          renderProfile(localizeProfile(data.profile, data.translations)),
        );
      render();
      document.addEventListener("nfc-language-change", render);
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
