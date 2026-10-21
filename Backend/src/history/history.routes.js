const router = require('express').Router();
const { requireAuth } = require('../auth/auth.middleware');
const { getHistory } = require('./history.controller');
router.get('/', requireAuth, getHistory);
module.exports = router;
