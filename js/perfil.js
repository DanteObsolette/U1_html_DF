(function () {
    function setLine(el, text) {
        if (!el) return;
        el.hidden = !text;
        el.textContent = text || "";
    }

    async function initProfilePage() {
        var session = typeof getSessionUser === "function" ? getSessionUser() : null;
        if (!session) {
            window.location.href = "login.html";
            return;
        }

        var form = document.getElementById("profile-form");
        var err = document.getElementById("profile-error");
        var ok = document.getElementById("profile-success");
        var fullName = document.getElementById("full_name");
        var email = document.getElementById("email");
        var role = document.getElementById("role");
        var birth = document.getElementById("birth_date");
        var errFull = document.getElementById("err-full_name");
        var errBirth = document.getElementById("err-birth_date");

        if (!form || !window.SportClubApi) return;

        try {
            var res = await window.SportClubApi.getMe();
            var u = res.data;
            if (typeof mergeSessionFromUser === "function") mergeSessionFromUser(u);
            fullName.value = u.full_name || "";
            email.value = u.email || "";
            role.value =
                u.role === "admin"
                    ? "Administrador"
                    : u.role === "coach"
                      ? "Coach"
                      : "Usuario";
            birth.value = u.birth_date || "";
            var nameEl = document.getElementById("user-display-name");
            if (nameEl) nameEl.textContent = u.full_name || u.email || "";
        } catch (e) {
            setLine(err, (e.body && e.body.message) || e.message || "No se pudieron cargar los datos.");
        }

        protectDashboard(null);

        form.addEventListener("submit", async function (e) {
            e.preventDefault();
            setLine(err, "");
            setLine(ok, "");
            if (errFull) errFull.textContent = "";
            if (errBirth) errBirth.textContent = "";

            var payload = {
                full_name: fullName.value.trim(),
                birth_date: birth.value ? birth.value : null,
            };

            try {
                var res2 = await window.SportClubApi.updateMe(payload);
                var updated = res2.data;
                if (typeof mergeSessionFromUser === "function") mergeSessionFromUser(updated);
                var nameEl2 = document.getElementById("user-display-name");
                if (nameEl2) nameEl2.textContent = updated.full_name || updated.email || "";
                setLine(ok, "Perfil actualizado correctamente.");
            } catch (ex) {
                var apiErr = (ex.body && ex.body.errors) || {};
                if (apiErr.full_name && errFull) errFull.textContent = String(apiErr.full_name);
                if (apiErr.birth_date && errBirth) errBirth.textContent = String(apiErr.birth_date);
                var parts = window.SportClubApi.flattenErrors(apiErr);
                setLine(
                    err,
                    (ex.body && ex.body.message) ||
                        (parts.length ? parts.join(" ") : ex.message) ||
                        "No se pudo guardar el perfil."
                );
            }
        });
    }

    window.initProfilePage = initProfilePage;
})();
