const { DEC8_BIN } = require('mysql/lib/protocol/constants/charsets');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;

// Conexión con la base de datos
const db = require('../database');
const helpers = require('../lib/helpers');

passport.use('local.login', new Strategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    let user = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (user.length === 1) {
        user = user[0];
        if (await helpers.matchPass(password, user.password)) {
            done(null, user, req.flash('ok', 'Bienvenid@'));
        } else {
            done(null, false, req.flash('fail', 'Contraseña incorrecta'));
        }
    } else {
        return done(null, false, req.flash('fail', 'Usuario no registrado'));
    }
}));

passport.use('local.register', new Strategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    const newUser = {
        email: email,
        password: password,
        nombre: req.body.nombre
    };

    newUser.password = await helpers.encrypt(password);
    const result = await db.query('INSERT INTO usuarios SET ?', [newUser]);
    return done(null, newUser);
}));

passport.serializeUser((user, done) => {
    done(null, user.email);
});

passport.deserializeUser(async (email, done) => {
    const users = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    done(null, users[0]);
});