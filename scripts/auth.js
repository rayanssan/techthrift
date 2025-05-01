"use strict";

const domain = "dev-l8ytlq131pzoy67u.us.auth0.com";
const clientId = "L1fWb50rJ2E6mPWVuJsynrqskjQ7454Q";
const redirectUri = window.location.origin + "/authentication";

async function login() {
  const url = `https://${domain}/authorize?response_type=token&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid profile email&connection=Username-Password-Authentication`;
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

    let loggedInUser = await response.json();
    const event = new CustomEvent('userAuthenticated', { detail: loggedInUser });
    window.dispatchEvent(event);

    const newClient = {
      name: loggedInUser.nickname,
      email: loggedInUser.email
      // TODO Add the rest of the fields
    };
    // POST user to the database
    const addResponse = await fetch('/ttuser/client/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newClient)
    });

    if (!addResponse.ok) {
      const errMessage = await addResponse.text();
      throw new Error(`Failed to add user: ${errMessage}`);
    }

    console.log("Client:", loggedInUser);

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
    if (document.getElementById('username')) {
      document.querySelector('#username').innerHTML = `
      <img alt="User Picture" src=${loggedInUser.picture} alt="User Picture" 
      class="rounded-circle me-md-2" style="scale:1.1;" width="22" height="22">
      <p class="d-none d-md-block mb-0">${loggedInUser.nickname}</p>`;
    }
  } catch (err) {
    console.error("Error while trying to obtain profile:", err);
    setTimeout(() => {
      location.reload();
    }, 3000);
  }
}

window.onload = async () => {
  let token = getAccessTokenFromUrl();

  if (token) {
    localStorage.setItem("access_token", token);
    // Corrigido: não força caminho fixo
    window.history.replaceState(null, "", window.location.pathname);
  } else {
    token = localStorage.getItem("access_token");
  }

  if (token) {
    await getUserProfile(token);
  } else {
    // Garantir que os botões existem antes de mexer neles
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
        Array.from(document.querySelectorAll("footer li a")).
          find(e => e.textContent.trim() === t))));


    const event = new CustomEvent('userAuthenticated', { detail: null });
    window.dispatchEvent(event);
  }
};