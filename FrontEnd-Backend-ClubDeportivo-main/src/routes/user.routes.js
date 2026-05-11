const { Router } = require('express');
const userController = require('../controllers/user.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

const router = Router();

router.use(authenticate);
router.use(requireRole('admin'));
router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.remove);

module.exports = router;