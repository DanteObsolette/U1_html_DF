const { User } = require('../models');

const findAll = (filters = {}) => {
    return User.findAll({
        where: filters,
        order: [['id', 'ASC']]
    });
};

const findById = (id, options = {}) => {
    return User.findByPk(id, options);
};

const findByEmail = (email, options = {}) => {
    return User.findOne({
        where: {
            email: String(email || '').trim().toLowerCase()
        },
        ...options
    });
};

const create = (payload) => {
    return User.create(payload);
};

async function updateById(id, payload) {
    const user = await User.scope('withPassword').findByPk(id);

    if (!user) return null;

    await user.update(payload);

    return User.findByPk(id);
}

async function deleteById(id) {
    const user = await User.findByPk(id);

    if (!user) return null;

    await user.destroy();

    return true;
}

module.exports = {
    findAll,
    findById,
    findByEmail,
    create,
    updateById,
    updateUser: updateById,
    deleteById
};