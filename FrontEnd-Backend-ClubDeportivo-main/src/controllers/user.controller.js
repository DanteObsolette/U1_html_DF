const userService = require('../services/user.service');
const { success } = require('../utils/api-response');
const { validateUserPayload } = require('../validators/user.validator');

async function getAll(req, res, next) {
    try {
        const filters = {};
        if (req.query.role) filters.role = req.query.role;
        const users = await userService.listUsers(filters);
        return success(res, 'Listado de usuarios.', users);
    } catch (error) {
        next(error);
    }
}

async function getById(req, res, next) {
    try {
        const user = await userService.getUserById(req.params.id);
        return success(res, 'Usuario encontrado.', user);
    } catch (error) {
        next(error);
    }
}

async function create(req, res, next) {
    try {
        const { isValid, errors, data } = validateUserPayload(req.body);
        if (!isValid) {
            return res.status(400).json({ ok: false, message: 'Payload inválido.', errors });
        }

        const user = await userService.createUser(data);
        return success(res, 'Usuario creado correctamente.', user, 201);
    } catch (error) {
        next(error);
    }
}

async function update(req, res, next) {
    try {
        const { isValid, errors, data } = validateUserPayload(req.body, { partial: true });
        if (!isValid) {
            return res.status(400).json({ ok: false, message: 'Payload inválido.', errors });
        }

        const user = await userService.updateUser(req.params.id, data);
        return success(res, 'Usuario actualizado correctamente.', user);
    } catch (error) {
        next(error);
    }
}

async function remove(req, res, next) {
    try {
        if (req.user.id == req.params.id) {
            return res.status(400).json({
                ok: false,
                message: 'No puedes eliminar tu propio usuario.'
            });
        }

        const deleted = await userService.deleteUser(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                ok: false,
                message: 'Usuario no encontrado.'
            });
        }

        return success(res, 'Usuario eliminado correctamente.');
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};