const domain = "dev-l8ytlq131pzoy67u.us.auth0.com";
const clientId = "L1fWb50rJ2E6mPWVuJsynrqskjQ7454Q";
const redirectUri = window.location.origin + "/authentication";

function login() {
  const url = `https://${domain}/authorize?response_type=token&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid profile email`;
  window.location.href = url;
}

function logout() {
  localStorage.removeItem("access_token");
  const url = `https://${domain}/v2/logout?client_id=${clientId}&returnTo=${redirectUri}`;
  window.location.href = url;
}

function getAccessTokenFromUrl() {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.slice(1));
  return params.get("access_token");
}

async function getUserProfile(token) {
  try {
    const response = await fetch(`https://${domain}/userinfo`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error(await response.text());

    const user = await response.json();
    console.log("Utilizador:", user);

    const nameEl = document.getElementById("user-name");
    const picEl = document.getElementById("user-pic");
    const infoEl = document.getElementById("user-info");

    if (nameEl) nameEl.textContent = user.name || user.nickname;
    if (picEl) picEl.src = user.picture;
    if (infoEl) infoEl.classList.remove("d-none");

    const loginBtn = document.getElementById("btn-login");
    const logoutBtn = document.getElementById("btn-logout");
    if (loginBtn) loginBtn.classList.add("d-none");
    if (logoutBtn) logoutBtn.classList.remove("d-none");
  } catch (err) {
    console.error("Erro a obter perfil:", err);
    logout();
  }
}

window.onload = () => {
  let token = getAccessTokenFromUrl();

  if (token) {
    localStorage.setItem("access_token", token);
    // Corrigido: não força caminho fixo
    window.history.replaceState(null, "", window.location.pathname);
  } else {
    token = localStorage.getItem("access_token");
  }

  if (token) {
    getUserProfile(token);
  } else {
    // Garantir que os botões existem antes de mexer neles
    const loginBtn = document.getElementById("btn-login");
    const logoutBtn = document.getElementById("btn-logout");
    const infoEl = document.getElementById("user-info");

    if (loginBtn) loginBtn.classList.remove("d-none");
    if (logoutBtn) logoutBtn.classList.add("d-none");
    if (infoEl) infoEl.classList.add("d-none");
  }
};
