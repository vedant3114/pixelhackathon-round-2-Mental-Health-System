const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

router.post('/verify', verifyToken, (req, res) => {
  res.status(200).json({
    message: 'Token verified successfully',
    user: req.user,  // contains uid, email, etc.
  });
});

module.exports = router;
