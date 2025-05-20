"use strict";

const domain = "dev-1qdq127lj6aekksz.us.auth0.com";
const clientId = "iZ7i3x872x2Lwwg9I3jwg50JgePjaB3a";
const redirectUri = window.location.origin;

/**
 * Logs out the user by clearing local storage and redirecting to Auth0 logout URL.
 * 
 * @function logout
 */
function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem('loggedInUser');
  const logoutUrl = `https://${domain}/v2/logout?client_id=${clientId}&returnTo=${encodeURIComponent(redirectUri)}&federated`;

  window.location.href = logoutUrl;
}

/**
 * Retrieves the access token from the URL hash fragment.
 * 
 * @function getAccessTokenFromUrl
 * @returns {string|null} The access token if present, otherwise null.
 */
function getAccessTokenFromUrl() {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.slice(1));
  return params.get("access_token");
}

/**
 * Fetches the user's profile using the provided access token, stores it in 
 * localStorage, and dispatches events/UI updates.
 * 
 * @async
 * @function getUserProfile
 * @param {string} token - The access token.
 * @returns {Promise<Object|null>} The user profile object if successful, or null if there's an error.
 */
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
      // Save to localStorage
      localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
    }
    // Dispatch user authentication event
    const event = new CustomEvent('userAuthenticated', { detail: loggedInUser });
    window.dispatchEvent(event);

    console.log("Client:", loggedInUser);

    // Check if the user already exists
    const clientCheckRes = await fetch(`/ttuser/client/${encodeURIComponent(loggedInUser.email)}`);
    if (clientCheckRes.status === 404) {
      if (document.body.id !== 'registrationPage') {
        window.location.href = '/registration';
      }
    }

    // Alter UI accordingly
    adjustUI(loggedInUser);

    return loggedInUser;
  } catch (err) {
    console.error("Error while trying to obtain profile:", err);
    setTimeout(() => {
      location.reload();
    }, 3000);
  }
}

/**
 * Updates the UI based on whether a user is logged in.
 * 
 * @function adjustUI
 * @param {Object|null} loggedInUser - The user profile object, or null if not authenticated.
 */
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
        Array.from(document.querySelectorAll("footer li a")).
          find(e => e.textContent.trim() === t))));


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
      <img alt="User Picture" src=${loggedInUser.picture} alt="User Picture" 
      class="rounded-circle me-md-2" style="scale:1.1;" width="22" height="22">
      <p class="d-none d-md-block mb-0">${loggedInUser.nickname}</p>`;
      usernameBtn.href = "";

      usernameBtn.addEventListener("click", (event) => {
        event.preventDefault();

        // Check if dropdown already exists to toggle it
        let existingDropdown = document.getElementById("profileDropdown");
        if (existingDropdown) {
          existingDropdown.remove(); // remove if already open
          return;
        }

        // Create dropdown menu
        const dropdown = document.createElement("div");
        dropdown.className = "dropdown-menu mt-1 show position-absolute";
        dropdown.id = "profileDropdown";
        dropdown.style.top = `${usernameBtn.offsetTop + usernameBtn.offsetHeight}px`;
        dropdown.style.left = `${usernameBtn.offsetLeft}px`;
        dropdown.style.width = `${usernameBtn.offsetWidth}px`;

        // Add menu items
        dropdown.innerHTML = `
          <a class="dropdown-item" style="cursor:pointer;" href="/profile"><i class="fa fa-user me-2"></i> My Profile</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" style="cursor:pointer;" onclick="logout()"><i class="fa fa-sign-out-alt me-2"></i>  Logout</a>
        `;

        // Add dropdown to body
        document.body.appendChild(dropdown);

        // Defer adding the outside click listener
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
    const loggedInUser = await getUserProfile(token);

    if (document.body.id == 'registrationPage') {
      document.getElementById("registration-form").addEventListener("submit", (event) => {
        event.preventDefault();
        // POST user to the database
        const newClient = {
          name: loggedInUser.nickname,
          email: loggedInUser.email
          // TODO Add the rest of the fields
        };

        fetch('/ttuser/client/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newClient)
        })
          .then(async response => {
            if (!response.ok) {
              const errMessage = await response.text();
              throw new Error(`Failed to add user: ${errMessage}`);
            }
            location.href = "/homepage";
          })
      })
    }
  } else {
    token = localStorage.getItem("access_token");
    adjustUI(null);
  }
};