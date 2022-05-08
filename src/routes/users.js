const express = require('express');
const router = express.Router();
const passport = require('passport');
const helpers = require('../lib/helpers');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login');
});

router.get('/profile', helpers.userLog, (req, res) => {
    res.render('users/profile');
});

router.post('/register', passport.authenticate('local.register', {
    successRedirect: '/profile',
    failureRedirect: '/register',
    failureFlash: true
}));

router.post('/login', passport.authenticate('local.login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}));

module.exports = router;