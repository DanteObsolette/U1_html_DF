var DASHBOARD_BY_ROLE = {
    user: "usuario.html",
    coach: "entrenador.html",
    admin: "administrador.html",
};

function getSessionUser() {
    try {
        var raw = localStorage.getItem("user");
        if (!raw) return null;
        var data = JSON.parse(raw);
        if (!data || typeof data !== "object") return null;
        if (!data.token || !data.email || !data.role) return null;
        return data;
    } catch {
        return null;
    }
}

function persistApiSession(loginPayload) {
    if (!loginPayload || !loginPayload.token || !loginPayload.user) return;
    var u = loginPayload.user;
    var session = Object.assign({}, u, { token: loginPayload.token });
    localStorage.setItem("user", JSON.stringify(session));
}

function mergeSessionFromUser(user) {
    if (!user) return;
    var prev = getSessionUser() || {};
    localStorage.setItem(
        "user",
        JSON.stringify(Object.assign({}, prev, user, { token: prev.token }))
    );
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

function redirectForRole(role) {
    var path = DASHBOARD_BY_ROLE[role] || "login.html";
    window.location.href = path;
}

/**
 * @param {"user"|"coach"|"admin"|null} expectedRole - null = cualquier sesión válida
 */
function protectDashboard(expectedRole) {
    var session = getSessionUser();
    if (!session) {
        window.location.href = "login.html";
        return;
    }
    if (expectedRole && session.role !== expectedRole) {
        redirectForRole(session.role);
        return;
    }
    var displayName = session.full_name || session.name || session.email;
    var nameEl = document.getElementById("user-display-name");
    if (nameEl) nameEl.textContent = displayName;
    var nameProfileEl = document.getElementById("user-display-name-profile");
    if (nameProfileEl) nameProfileEl.textContent = displayName;
    var emailEl = document.getElementById("user-display-email");
    if (emailEl) emailEl.textContent = session.email || session.user || "";
    var logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
}

function initLoginPage() {
    var form = document.getElementById("login-form");
    var errorBox = document.getElementById("login-error");
    if (!form || !errorBox || !window.SportClubApi) return;

    function hideError() {
        errorBox.hidden = true;
        errorBox.textContent = "";
    }

    function showMessage(text) {
        errorBox.hidden = false;
        errorBox.textContent = text;
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        hideError();

        var emailInput = document.getElementById("email");
        var passwordInput = document.getElementById("password");
        var email = emailInput ? emailInput.value : "";
        var password = passwordInput ? passwordInput.value : "";

        if (!String(email).trim() || !password) {
            showMessage("No se pudo acceder al sitio");
            return;
        }

        try {
            var res = await window.SportClubApi.login(email, password);
            var data = res.data;
            persistApiSession(data);
            redirectForRole(data.user.role);
        } catch (err) {
            var parts = window.SportClubApi.flattenErrors(
                err.body && err.body.errors ? err.body.errors : {}
            );
            var msg =
                (err.body && err.body.message) ||
                (parts.length ? parts.join(" ") : null) ||
                err.message ||
                "No se pudo acceder al sitio";
            showMessage(msg);
        }
    });
}
