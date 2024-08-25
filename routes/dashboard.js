const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('layouts/landingPage');
})

router.get('/oil-guard', (req, res) => {
    res.render('homepage');
})

router.get('/about', (req, res) => {
    res.render('about');
})
module.exports = router;