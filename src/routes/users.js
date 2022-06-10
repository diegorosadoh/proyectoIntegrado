const express = require('express');
const router = express.Router();
const passport = require('passport');
const helpers = require('../lib/helpers');

// Conexión con la base de datos
const db = require('../database');

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

// Verificar email
router.get('/verify/:code', async (req, res) => {
    let pendingUser = await db.query('SELECT * FROM pending_usuarios WHERE code = ?', [req.params.code]);
    if (pendingUser.length === 1) {
        pendingUser = pendingUser[0];
        let newUser = pendingUser.user.split(";");
        await db.query('INSERT INTO usuarios (email, password, nombre) VALUES (?);', [newUser]);

        req.flash('ok', 'Cuenta verificada');
        res.redirect('/login');
    } else {
        req.flash('fail', 'Error en la verificación');
        res.redirect('/register');
    }
});

/* FORMULARIOS */
// Registro
router.post('/register', passport.authenticate('register', {
    successRedirect: '/login',
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