const express = require('express');
const authController = require('../controller/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, async (req, res) => {    
  res.json({user:req.user})
});

module.exports = router;