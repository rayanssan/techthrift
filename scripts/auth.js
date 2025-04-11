let auth0Client = null;

const fetchAuthConfig = () => fetch("/auth_config.json");

const configureClient = async ()  => {
    const response = await fetchAuthConfig();
    const config = await response.json();

    auth0Client = await auth0.createAuth0Client({
        domain: config.domain,
        clientId: config.clientId
    });
};

window.onload = async () => {
    await configureClient();

    const query = window.location.search;

    // Se vieste do Auth0 com "code" e "state", trata isso primeiro
    if (query.includes("code=") && query.includes("state=")) {
        try {
            await auth0Client.handleRedirectCallback();
            // Limpa a URL (sem query params)
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
            console.error("Erro ao tratar callback:", err);
        }
    }

    // Agora verifica autenticação real e atualiza UI
    try {
        await updateUI();
    } catch (err) {
        console.warn("updateUI falhou (elementos podem não existir nesta página)", err);
    }
};


const updateUI = async () => {

    const isAuthenticated = await auth0Client.isAuthenticated();

    const loginBtn = document.getElementById("btn-login");
    const logoutBtn = document.getElementById("btn-logout");
    
    const gatedContent = document.getElementById("gated-content");
    const tokenOutput = document.getElementById("ipt-access-token");
    const userOutput = document.getElementById("ipt-user-profile");

    
    if (isAuthenticated){
        loginBtn.disabled = true;
        logoutBtn.disabled = false;
    }else{
        loginBtn.disabled = false;
        logoutBtn.disabled = true;
    }
    

    if (gatedContent) {
        if (isAuthenticated) {
            gatedContent.classList.remove("hidden");
        } else {
            gatedContent.classList.add("hidden");
        }
    }

    if (isAuthenticated && tokenOutput && userOutput) {
        const token = await auth0Client.getTokenSilently();
        const user = await auth0Client.getUser();
        tokenOutput.innerHTML = token;
        userOutput.textContent = JSON.stringify(user, null, 2);
    }
};


const login = async() => {
    
    await auth0Client.loginWithRedirect({
        authorizationParams:{
            redirect_uri: "http://localhost:3000/authentication"
        }
    });
};

