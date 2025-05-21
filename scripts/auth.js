"use strict";

const domain = "dev-1qdq127lj6aekksz.us.auth0.com";
const clientId = "iZ7i3x872x2Lwwg9I3jwg50JgePjaB3a";
const redirectUri = window.location.origin;

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem('loggedInUser');
  localStorage.removeItem('user'); // garantir limpeza
  const logoutUrl = `https://${domain}/v2/logout?client_id=${clientId}&returnTo=${encodeURIComponent(redirectUri)}&federated`;
  window.location.href = logoutUrl;
}

function getAccessTokenFromUrl() {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.slice(1));
  return params.get("access_token");
}

async function getUserProfile(token) {
  try {
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
      const response = await fetch(`https://${domain}/userinfo`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error(await response.text());

      loggedInUser = await response.json();
      localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
    }

    const event = new CustomEvent('userAuthenticated', { detail: loggedInUser });
    window.dispatchEvent(event);

    console.log("Client:", loggedInUser);

    // Verificar se o utilizador já existe na BD
    let clientRes = await fetch(`/ttuser/client/${encodeURIComponent(loggedInUser.email)}`);

    if (clientRes.status === 404) {
      // Se não existir, criar cliente
      const createRes = await fetch('/ttuser/client/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: loggedInUser.nickname,
          email: loggedInUser.email
        })
      });

      if (!createRes.ok) {
        const errMsg = await createRes.text();
        throw new Error(`Erro ao criar cliente: ${errMsg}`);
      }

      // Repetir fetch agora que foi criado
      clientRes = await fetch(`/ttuser/client/${encodeURIComponent(loggedInUser.email)}`);
    }

    if (!clientRes.ok) {
      const msg = await clientRes.text();
      throw new Error(`Erro ao obter cliente: ${msg}`);
    }

    const clientData = await clientRes.json();
    localStorage.setItem('user', JSON.stringify({
      id: clientData.id,
      name: clientData.name,
      email: clientData.email
    }));

    if (document.body.id !== 'registrationPage') {
      window.location.href = '/registration';
    }

    adjustUI(loggedInUser);
    return loggedInUser;

  } catch (err) {
    console.error("Erro ao obter ou criar perfil:", err);
    setTimeout(() => {
      location.reload();
    }, 3000);
  }
}

function adjustUI(loggedInUser) {
  if (!loggedInUser) {
    const loginBtn = document.getElementById("btn-login");
    const logoutBtn = document.getElementById("btn-logout");
    const infoEl = document.getElementById("user-info");

    if (loginBtn) loginBtn.classList.remove("d-none");
    if (logoutBtn) logoutBtn.classList.add("d-none");
    if (infoEl) infoEl.classList.add("d-none");

    if (document.getElementById('username')) {
      document.querySelector('#username p').textContent = "Sign in";
    }
    if (document.getElementById('wishlist')) {
      document.getElementById('wishlist').remove();
    }
    ["My orders", "Refunds"].forEach(
      t => ((l => l && (l.href = "/authentication"))(
        Array.from(document.querySelectorAll("footer li a"))
          .find(e => e.textContent.trim() === t))));

    const event = new CustomEvent('userAuthenticated', { detail: null });
    window.dispatchEvent(event);
  } else {
    const nameEl = document.getElementById("user-name");
    const picEl = document.getElementById("user-pic");
    const infoEl = document.getElementById("user-info");

    if (nameEl) nameEl.textContent = loggedInUser.name || loggedInUser.nickname;
    if (picEl) picEl.src = loggedInUser.picture;
    if (infoEl) infoEl.classList.remove("d-none");

    const loginBtn = document.getElementById("btn-login");
    const logoutBtn = document.getElementById("btn-logout");
    if (loginBtn) loginBtn.classList.add("d-none");
    if (logoutBtn) logoutBtn.classList.remove("d-none");

    const usernameBtn = document.getElementById('username');
    if (usernameBtn) {
      usernameBtn.innerHTML = `
      <img alt="User Picture" src=${loggedInUser.picture} class="rounded-circle me-md-2" style="scale:1.1;" width="22" height="22">
      <p class="d-none d-md-block mb-0">${loggedInUser.nickname}</p>`;
      usernameBtn.href = "";

      usernameBtn.addEventListener("click", (event) => {
        event.preventDefault();

        let existingDropdown = document.getElementById("profileDropdown");
        if (existingDropdown) {
          existingDropdown.remove();
          return;
        }

        const dropdown = document.createElement("div");
        dropdown.className = "dropdown-menu mt-1 show position-absolute";
        dropdown.id = "profileDropdown";
        dropdown.style.top = `${usernameBtn.offsetTop + usernameBtn.offsetHeight}px`;
        dropdown.style.left = `${usernameBtn.offsetLeft}px`;
        dropdown.style.width = `${usernameBtn.offsetWidth}px`;

        dropdown.innerHTML = `
          <a class="dropdown-item" href="/profile"><i class="fa fa-user me-2"></i> My Profile</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" onclick="logout()"><i class="fa fa-sign-out-alt me-2"></i>  Logout</a>
        `;

        document.body.appendChild(dropdown);

        setTimeout(() => {
          const closeDropdown = (e) => {
            if (!dropdown.contains(e.target) && e.target !== usernameBtn) {
              dropdown.remove();
              document.removeEventListener("click", closeDropdown);
            }
          };
          document.addEventListener("click", closeDropdown);
        }, 0);

        window.addEventListener("resize", () => {
          dropdown.style.top = `${usernameBtn.offsetTop + usernameBtn.offsetHeight}px`;
          dropdown.style.left = `${usernameBtn.offsetLeft}px`;
          dropdown.style.width = `${usernameBtn.offsetWidth}px`;
        });
      });

      usernameBtn.addEventListener("dblclick", (event) => {
        event.preventDefault();
        window.location.href = "/profile";
      });
    }
  }
}

window.onload = async () => {
  let token = getAccessTokenFromUrl() || localStorage.getItem("access_token");

  if (token) {
    localStorage.setItem("access_token", token);
    await getUserProfile(token);
  } else {
    token = localStorage.getItem("access_token");
    adjustUI(null);
  }
};
