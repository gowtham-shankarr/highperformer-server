const express = require('express');
const router = express.Router();
const listController = require('../controllers/drag');

router.get('/', (req, res) => {
    res.send('List route is working');
});

router.get('/', (req, res) => {
    console.log('Route /list is hit');
    listController.getList(req, res);
});

module.exports = router;


module.exports = router;
