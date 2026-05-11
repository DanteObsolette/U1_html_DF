const userRepository = require('../repositories/user.repository');
const { signAccessToken } = require('../utils/jwt');

async function login({ email, password }) {
    const user = await userRepository.findByEmail(email, {
        attributes: { include: ['password'] }
    });

    if (!user) {
        const error = new Error('Credenciales inválidas.');
        error.statusCode = 401;
        throw error;
    }

    const isValid = await user.isPasswordValid(password);

    if (!isValid) {
        const error = new Error('Credenciales inválidas.');
        error.statusCode = 401;
        throw error;
    }

    const token = signAccessToken(user);

    return {
        token,
        user: user.toSafeJSON()
    };
}

async function changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId, {
        attributes: { include: ['password'] }
    });

    if (!user) {
        const error = new Error('Usuario no encontrado.');
        error.statusCode = 404;
        throw error;
    }

    // Validar contraseña actual
    const isValid = await user.isPasswordValid(currentPassword);

    if (!isValid) {
        const error = new Error('La contraseña actual es incorrecta.');
        error.statusCode = 401;
        throw error;
    }

    // Actualizar usuario
    await userRepository.updateUser(userId, {
        password: newPassword,
        must_change_password: false
    });

    return true;
}

module.exports = {
    login,
    changePassword
};