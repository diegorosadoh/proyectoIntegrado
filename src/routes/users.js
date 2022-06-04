const express = require('express');
const router = express.Router();
const passport = require('passport');
const helpers = require('../lib/helpers');

/* RENDERIZADO DE VISTAS */
// Registro
router.get('/register', (req, res) => {
    res.render('users/register');
});

// Login
router.get('/login', (req, res) => {
    res.render('users/login');
});

// Logout
router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login');
});

// Perfil
router.get('/profile', helpers.userLog, async (req, res) => {
    res.render('users/profile');
});

/* FORMULARIOS */
// Registro
router.post('/register', passport.authenticate('register', {
    successRedirect: '/links',
    failureRedirect: '/register',
    failureFlash: true
}));

// Login
router.post('/login', passport.authenticate('login', {
    successRedirect: '/links',
    failureRedirect: '/login',
    failureFlash: true
}));

module.exports = router;