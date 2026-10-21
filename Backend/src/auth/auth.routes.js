const router = require('express').Router();
const { login } = require('./auth.controller');
const { registerCustomer } = require('../users/user.controller');
router.post('/login', login);
router.post('/register', registerCustomer);
module.exports = router;
