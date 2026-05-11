(function () {
    function getApiBase() {
        return window.SPORTCLUB_API_BASE || "http://localhost:3000/api";
    }

    function readSession() {
        try {
            var raw = localStorage.getItem("user");
            if (!raw) return null;
            var data = JSON.parse(raw);
            return data && typeof data === "object" ? data : null;
        } catch {
            return null;
        }
    }

    function authHeaders() {
        var s = readSession();
        var h = { "Content-Type": "application/json" };
        if (s && s.token) {
            h.Authorization = "Bearer " + s.token;
        }
        return h;
    }

    /**
     * @param {string} path - ej. "/auth/login" (relativo a la base /api)
     * @param {RequestInit & { json?: object }} options
     */
    async function apiRequest(path, options) {
        var url = getApiBase().replace(/\/$/, "") + path;
        var init = Object.assign({}, options);
        init.headers = Object.assign({}, authHeaders(), init.headers || {});
        if (init.json !== undefined) {
            init.body = JSON.stringify(init.json);
            delete init.json;
        }
        var res = await fetch(url, init);
        var body = null;
        try {
            body = await res.json();
        } catch {
            body = {};
        }
        if (!res.ok) {
            var err = new Error((body && body.message) || "Error en la solicitud.");
            err.status = res.status;
            err.body = body;
            throw err;
        }
        return body;
    }

    function flattenErrors(errors) {
        if (!errors || typeof errors !== "object") return [];
        var lines = [];
        Object.keys(errors).forEach(function (key) {
            var val = errors[key];
            if (Array.isArray(val)) {
                val.forEach(function (item) {
                    lines.push(key + ": " + String(item));
                });
            } else if (val) {
                lines.push(String(val));
            }
        });
        return lines;
    }

    window.SportClubApi = {
        getApiBase: getApiBase,
        readSession: readSession,
        apiRequest: apiRequest,
        flattenErrors: flattenErrors,

        login: function (email, password) {
            return apiRequest("/auth/login", {
                method: "POST",
                json: { email: String(email).trim().toLowerCase(), password: password },
            });
        },

        register: function (payload) {
            return apiRequest("/auth/register", {
                method: "POST",
                json: payload,
            });
        },

        getMe: function () {
            return apiRequest("/auth/me", { method: "GET" });
        },

        updateMe: function (payload) {
            return apiRequest("/auth/me", {
                method: "PUT",
                json: payload,
            });
        },

        listUsers: function () {
            return apiRequest("/users", { method: "GET" });
        },

        getUser: function (id) {
            return apiRequest("/users/" + encodeURIComponent(id), { method: "GET" });
        },

        createUser: function (payload) {
            return apiRequest("/users", {
                method: "POST",
                json: payload,
            });
        },

        updateUser: function (id, payload) {
            return apiRequest("/users/" + encodeURIComponent(id), {
                method: "PUT",
                json: payload,
            });
        },

        deleteUser: function (id) {
            return apiRequest("/users/" + encodeURIComponent(id), {
                method: "DELETE",
            });
        },
    };
})();
