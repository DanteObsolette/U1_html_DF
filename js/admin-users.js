(function () {
    var tableBody = null;
    var pageError = null;
    var deleteTargetId = null;

    function showPageError(msg) {
        if (!pageError) return;
        pageError.hidden = !msg;
        pageError.textContent = msg || "";
    }

    function esc(s) {
        return String(s == null ? "" : s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/"/g, "&quot;");
    }

    async function loadUsers() {
        showPageError("");
        try {
            var res = await window.SportClubApi.listUsers();
            renderTable(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            if (e.status === 401 || e.status === 403) {
                window.location.href = "login.html";
                return;
            }
            showPageError((e.body && e.body.message) || e.message || "No se pudo cargar el listado.");
        }
    }

    function renderTable(users) {
        if (!tableBody) return;
        tableBody.innerHTML = "";
        users.forEach(function (u) {
            var tr = document.createElement("tr");
            tr.innerHTML =
                "<td>" +
                esc(u.id) +
                "</td><td>" +
                esc(u.full_name) +
                "</td><td>" +
                esc(u.email) +
                "</td><td>" +
                esc(u.role) +
                "</td><td>" +
                esc(u.birth_date || "—") +
                '</td><td class="table-actions">' +
                '<button type="button" class="btn-table btn-edit" data-id="' +
                esc(u.id) +
                '">Editar</button> ' +
                '<button type="button" class="btn-table btn-delete" data-id="' +
                esc(u.id) +
                '">Eliminar</button>' +
                "</td>";
            tableBody.appendChild(tr);
        });

        tableBody.querySelectorAll(".btn-edit").forEach(function (btn) {
            btn.addEventListener("click", function () {
                openEditDialog(Number(btn.getAttribute("data-id")), users);
            });
        });
        tableBody.querySelectorAll(".btn-delete").forEach(function (btn) {
            btn.addEventListener("click", function () {
                openDeleteDialog(Number(btn.getAttribute("data-id")), users);
            });
        });
    }

    function openEditDialog(id, users) {
        var u = users.find(function (x) {
            return x.id === id;
        });
        if (!u) return;
        var dlg = document.getElementById("dialog-edit");
        if (!dlg) return;
        document.getElementById("edit-id").value = String(u.id);
        document.getElementById("edit-full_name").value = u.full_name || "";
        document.getElementById("edit-email").value = u.email || "";
        document.getElementById("edit-role").value = u.role || "user";
        document.getElementById("edit-birth_date").value = u.birth_date || "";
        document.getElementById("edit-password").value = "";
        clearEditErrors();
        document.getElementById("edit-form-error").hidden = true;
        dlg.showModal();
    }

    function clearEditErrors() {
        ["edit-err-full_name", "edit-err-email", "edit-err-role", "edit-err-password", "edit-err-birth_date"].forEach(
            function (id) {
                var n = document.getElementById(id);
                if (n) n.textContent = "";
            }
        );
    }

    function openDeleteDialog(id, users) {
        var u = users.find(function (x) {
            return x.id === id;
        });
        deleteTargetId = id;
        var dlg = document.getElementById("dialog-delete");
        var msg = document.getElementById("delete-message");
        if (msg && u) {
            msg.textContent =
                "¿Eliminar al usuario " + u.full_name + " (" + u.email + ")? Esta acción no se puede deshacer.";
        }
        if (dlg) dlg.showModal();
    }

    function initAdminUsersPage() {
        protectDashboard("admin");

        tableBody = document.getElementById("users-table-body");
        pageError = document.getElementById("admin-page-error");

        var createForm = document.getElementById("admin-create-form");
        var editForm = document.getElementById("admin-edit-form");
        var btnCancelEdit = document.getElementById("btn-cancel-edit");
        var btnCancelDelete = document.getElementById("btn-cancel-delete");
        var btnConfirmDelete = document.getElementById("btn-confirm-delete");

        loadUsers();

        if (createForm) {
            createForm.addEventListener("submit", async function (e) {
                e.preventDefault();
                showPageError("");
                document.getElementById("create-form-error").hidden = true;
                var payload = {
                    full_name: document.getElementById("create-full_name").value.trim(),
                    email: document.getElementById("create-email").value.trim().toLowerCase(),
                    password: document.getElementById("create-password").value,
                    role: document.getElementById("create-role").value,
                    birth_date: document.getElementById("create-birth_date").value || null,
                    metadata: { sports: [] },
                };
                try {
                    await window.SportClubApi.createUser(payload);
                    createForm.reset();
                    await loadUsers();
                    showPageError("");
                    var ok = document.getElementById("create-form-success");
                    if (ok) {
                        ok.hidden = false;
                        ok.textContent = "Usuario creado correctamente.";
                        setTimeout(function () {
                            ok.hidden = true;
                        }, 4000);
                    }
                } catch (err) {
                    var fe = document.getElementById("create-form-error");
                    if (fe) {
                        fe.hidden = false;
                        fe.textContent =
                            (err.body && err.body.message) ||
                            window.SportClubApi.flattenErrors((err.body && err.body.errors) || {}).join(" ") ||
                            err.message;
                    }
                }
            });
        }

        if (editForm) {
            editForm.addEventListener("submit", async function (e) {
                e.preventDefault();
                clearEditErrors();
                var errBox = document.getElementById("edit-form-error");
                if (errBox) errBox.hidden = true;

                var id = document.getElementById("edit-id").value;
                var payload = {
                    full_name: document.getElementById("edit-full_name").value.trim(),
                    email: document.getElementById("edit-email").value.trim().toLowerCase(),
                    role: document.getElementById("edit-role").value,
                    birth_date: document.getElementById("edit-birth_date").value || null,
                };
                var pwd = document.getElementById("edit-password").value;
                if (pwd) payload.password = pwd;

                try {
                    await window.SportClubApi.updateUser(id, payload);
                    document.getElementById("dialog-edit").close();
                    await loadUsers();
                } catch (err) {
                    var apiErr = (err.body && err.body.errors) || {};
                    Object.keys(apiErr).forEach(function (k) {
                        var cell = document.getElementById("edit-err-" + k);
                        if (cell) cell.textContent = String(apiErr[k]);
                    });
                    if (errBox) {
                        errBox.hidden = false;
                        errBox.textContent =
                            (err.body && err.body.message) ||
                            window.SportClubApi.flattenErrors(apiErr).join(" ") ||
                            err.message;
                    }
                }
            });
        }

        if (btnCancelEdit) {
            btnCancelEdit.addEventListener("click", function () {
                document.getElementById("dialog-edit").close();
            });
        }
        if (btnCancelDelete) {
            btnCancelDelete.addEventListener("click", function () {
                document.getElementById("dialog-delete").close();
            });
        }
        if (btnConfirmDelete) {
            btnConfirmDelete.addEventListener("click", async function () {
                if (deleteTargetId == null) return;
                showPageError("");
                try {
                    await window.SportClubApi.deleteUser(deleteTargetId);
                    document.getElementById("dialog-delete").close();
                    deleteTargetId = null;
                    await loadUsers();
                } catch (err) {
                    document.getElementById("dialog-delete").close();
                    showPageError((err.body && err.body.message) || err.message || "No se pudo eliminar.");
                }
            });
        }
    }

    window.initAdminUsersPage = initAdminUsersPage;
})();
