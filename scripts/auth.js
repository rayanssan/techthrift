"use strict";

const domain = "dev-zh7o488rqjbnxicm.us.auth0.com";
const clientId = "tjm04Mw5yKgG5NDkcvXKnlptNTTAe5xM";
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
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  try {
    if (!loggedInUser) {
      const response = await fetch(`https://${domain}/userinfo`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error(await response.text());

      loggedInUser = await response.json();
    }

    const clientRes = await fetch(`/ttuser?email=${encodeURIComponent(loggedInUser.email)}`);

    // Check if the user already exists
    if (clientRes.status === 204) {
      // If client doesn't exist, send to registration
      if (document.body.id !== 'registrationPage') {
        window.location.href = '/registration';
      }
      return loggedInUser;
    }
    // const registeredUserUrl = '/homepage';  // URL para users registados
    // if (window.location.pathname !== registeredUserUrl) {
    //   window.location.href = registeredUserUrl;
    // }
    const clientData = await clientRes.json();
    let employeeData, storeData, charityData;

    try {
      const employeeRes = await fetch(`/ttuser/employee?email=${encodeURIComponent(loggedInUser.email)}`);
      if (employeeRes.ok) {
        employeeData = await employeeRes.json();
      }
    } catch (err) { }

    try {
      const storeRes = await fetch(`/ttuser/store?email=${encodeURIComponent(loggedInUser.email)}`);
      if (storeRes.ok) {
        storeData = await storeRes.json();
      }
    } catch (err) { }

    try {
      const charityRes = await fetch(`/ttuser/charity?email=${encodeURIComponent(loggedInUser.email)}`);
      if (charityRes.ok) {
        charityData = await charityRes.json();
      }
    } catch (err) { }

    // Merge all defined objects into loggedInUser
    loggedInUser = {
      ...clientData,
      ...(employeeData || {}),
      ...(storeData || {}),
      ...(charityData || {}),
      ...loggedInUser,
      nickname: clientData.name
    };

    // Alter UI accordingly
    adjustUI(loggedInUser);

    return loggedInUser;
  } catch (err) {
    console.error("Error while trying to obtain profile:", err);
    logout();
  } finally {
    if (!localStorage.getItem('loggedInUser')) {
      // Save logged in user to localStorage
      localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
    } else if (!JSON.parse(localStorage.getItem('loggedInUser')).id) {
      // Save logged in user to localStorage
      localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
    }
    // Dispatch user authentication event
    const event = new CustomEvent('userAuthenticated', { detail: loggedInUser });
    window.dispatchEvent(event);
    console.log("Client:", loggedInUser);
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

    if (window.location.pathname.startsWith('/admin')) {
      location.href = "/partners";
    }

    const event = new CustomEvent('userAuthenticated', { detail: null });
    window.dispatchEvent(event);
  } else {
    const usernameBtn = document.getElementById('username');

    ["My orders", "Refunds"].forEach(
      t => ((l => l && (l.href = "/profile"))(
        Array.from(document.querySelectorAll("footer li a")).
          find(e => e.textContent.trim() === t))));

    if (loggedInUser.user_type == "store") {
      if (!window.location.pathname.startsWith('/adminProfile')) {
        location.href = "/adminProfile";
      }
    }

    if (loggedInUser.user_type !== "client") {
      if (!window.location.pathname.startsWith('/admin')) {
        location.href = "/adminDashboard";
      }
    } else {
      if (window.location.pathname.startsWith('/admin')) {
        location.href = "/partners";
      }
    }

    if (usernameBtn && document.body.id != "partnersPage") {

      usernameBtn.innerHTML = `
      <img alt="User Picture" src=${loggedInUser.picture} alt="User Picture" 
      class="rounded-circle me-md-2" style="scale:1.1;" width="22" height="22">
      <p class="d-none d-md-block mb-0">${loggedInUser.user_type == "client" ? loggedInUser.nickname.split(" ")[0] : loggedInUser.nickname
        }</p>`;
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
        const dropdownWidth = usernameBtn.offsetWidth + 100;
        document.body.appendChild(dropdown);
        dropdown.style.top = `${usernameBtn.offsetTop + usernameBtn.offsetHeight}px`;
        dropdown.style.left = `${usernameBtn.offsetLeft + usernameBtn.offsetWidth - dropdownWidth}px`;
        dropdown.style.width = `${dropdownWidth}px`;

        // Add menu items
        dropdown.innerHTML = `
          <a class="dropdown-item" style="cursor:pointer;" 
          href="${loggedInUser.user_type == 'client' ? '/profile' : '/adminProfile'}"><i class="fa fa-user me-2"></i> My Profile</a>
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
          dropdown.style.left = `${usernameBtn.offsetLeft + usernameBtn.offsetWidth - dropdownWidth}px`;
          dropdown.style.width = `${dropdownWidth}px`;
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
    (async () => {
      await getUserProfile(token);
      document.body.classList.add('loaded');
    })();
  } else {
    token = localStorage.getItem("access_token");
    adjustUI(null);
    document.body.classList.add('loaded');
  }
};
