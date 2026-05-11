(function () {
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function showFormError(box, text) {
        if (!box) return;
        box.hidden = !text;
        box.textContent = text || "";
    }

    function setFieldError(id, msg) {
        var el = document.getElementById(id);
        if (!el) return;
        el.textContent = msg || "";
    }

    function clearFieldErrors() {
        document.querySelectorAll("[data-field-error]").forEach(function (n) {
            n.textContent = "";
        });
    }

    function validateClient(payload, confirmPassword) {
        var errors = {};
        if (!payload.full_name || payload.full_name.length < 3) {
            errors.full_name = "El nombre completo debe tener al menos 3 caracteres.";
        }
        if (!payload.email) {
            errors.email = "El correo es obligatorio.";
        } else if (!EMAIL_RE.test(payload.email)) {
            errors.email = "El correo no tiene un formato válido.";
        }
        if (!payload.password) {
            errors.password = "La contraseña es obligatoria.";
        } else if (payload.password.length < 8) {
            errors.password = "La contraseña debe tener mínimo 8 caracteres.";
        } else if (!/[A-Za-z]/.test(payload.password) || !/\d/.test(payload.password)) {
            errors.password = "Use una contraseña más segura: al menos una letra y un número.";
        }
        if (confirmPassword !== payload.password) {
            errors.confirm_password = "Las contraseñas no coinciden.";
        }
        return errors;
    }

    function initRegisterPage() {
        var form = document.getElementById("register-form");
        var globalErr = document.getElementById("register-error");
        var successBox = document.getElementById("register-success");
        if (!form || !window.SportClubApi) return;

        form.addEventListener("submit", async function (e) {
            e.preventDefault();
            clearFieldErrors();
            showFormError(globalErr, "");
            if (successBox) successBox.hidden = true;

            var full_name = document.getElementById("full_name").value.trim();
            var email = document.getElementById("email").value.trim().toLowerCase();
            var password = document.getElementById("password").value;
            var confirm_password = document.getElementById("confirm_password").value;
            var birthEl = document.getElementById("birth_date");
            var birth_date = birthEl && birthEl.value ? birthEl.value : null;

            var payload = {
                full_name: full_name,
                email: email,
                password: password,
                birth_date: birth_date,
                metadata: { sports: [] },
            };

            var clientErrors = validateClient(payload, confirm_password);
            if (Object.keys(clientErrors).length) {
                Object.keys(clientErrors).forEach(function (k) {
                    setFieldError("err-" + k, clientErrors[k]);
                });
                showFormError(
                    globalErr,
                    "Revise los campos marcados. La contraseña debe tener mínimo 8 caracteres y coincidir con la confirmación."
                );
                return;
            }

            try {
                await window.SportClubApi.register(payload);
                if (successBox) {
                    successBox.hidden = false;
                    successBox.textContent =
                        "Registro exitoso. Ya puede iniciar sesión con su correo y contraseña.";
                }
                form.reset();
            } catch (err) {
                var apiErrors = (err.body && err.body.errors) || {};
                Object.keys(apiErrors).forEach(function (k) {
                    var v = apiErrors[k];
                    setFieldError("err-" + k, Array.isArray(v) ? v.join(" ") : String(v));
                });
                var parts = window.SportClubApi.flattenErrors(apiErrors);
                var msg =
                    (err.body && err.body.message) ||
                    (parts.length ? parts.join(" ") : err.message) ||
                    "No fue posible completar el registro.";
                showFormError(globalErr, msg);
            }
        });
    }

    window.initRegisterPage = initRegisterPage;
})();
