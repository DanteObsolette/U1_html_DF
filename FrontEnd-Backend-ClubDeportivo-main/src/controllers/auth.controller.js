const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const { success } = require('../utils/api-response');
const { validateLoginPayload } = require('../validators/auth.validator');
const { validateUserPayload } = require('../validators/user.validator');

async function login(req, res, next) {
    try {
        const { isValid, errors } = validateLoginPayload(req.body);

        if (!isValid) {
            return res.status(400).json({
                ok: false,
                message: 'Payload inválido.',
                errors
            });
        }

        const result = await authService.login(req.body);
        return success(res, 'Login exitoso.', result);
    } catch (error) {
        next(error);
    }
}

async function registerUser(req, res, next) {
    try {
        const { isValid, errors, data } = validateUserPayload(req.body, {
            forceRole: 'user'
        });

        if (!isValid) {
            return res.status(400).json({
                ok: false,
                message: 'Payload inválido.',
                errors
            });
        }

        const user = await userService.createUser(data);
        return success(res, 'Usuario registrado correctamente.', user, 201);
    } catch (error) {
        next(error);
    }
}

function me(req, res) {
    return success(res, 'Usuario autenticado.', req.user);
}

async function updateMe(req, res, next) {
    try {
        const allowedData = {
            full_name: req.body.full_name,
            birth_date: req.body.birth_date,
            metadata: req.body.metadata
        };

        const { isValid, errors, data } = validateUserPayload(allowedData, {
            partial: true
        });

        if (!isValid) {
            return res.status(400).json({
                ok: false,
                message: 'Payload inválido.',
                errors
            });
        }

        const updatedUser = await userService.updateUser(req.user.id, data);

        return success(res, 'Perfil actualizado correctamente.', updatedUser);
    } catch (error) {
        next(error);
    }
}

async function changePassword(req, res, next) {
    try {
        const { current_password, new_password, confirm_password } = req.body;

        const errors = {};

        if (!current_password) {
            errors.current_password = 'La contraseña actual es obligatoria.';
        }

        if (!new_password) {
            errors.new_password = 'La nueva contraseña es obligatoria.';
        } else if (new_password.length < 8) {
            errors.new_password = 'La nueva contraseña debe tener mínimo 8 caracteres.';
        }

        if (!confirm_password) {
            errors.confirm_password = 'Debe confirmar la nueva contraseña.';
        } else if (new_password !== confirm_password) {
            errors.confirm_password = 'Las contraseñas no coinciden.';
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                ok: false,
                message: 'Payload inválido.',
                errors
            });
        }

        await authService.changePassword(req.user.id, current_password, new_password);

        return success(res, 'Contraseña actualizada correctamente.');
    } catch (error) {
        next(error);
    }
}

module.exports = {
    login,
    registerUser,
    me,
    updateMe,
    changePassword
};