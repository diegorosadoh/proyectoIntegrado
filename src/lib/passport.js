const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const nodemailer = require('nodemailer');

// Conexión con la base de datos
const db = require('../database');
const helpers = require('../lib/helpers');
const { emailOptions } = require('../utils');

// Registro
passport.use('register', new Strategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    newUser = {
        email: email,
        password: password,
        nombre: req.body.nombre
    };

    newUser.password = await helpers.encrypt(password);
    let verifyCode = await helpers.encrypt(email);
    verifyCode = verifyCode.replaceAll('/','').replaceAll(';','');

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'linkinapp.confirmation@gmail.com',
            pass: 'zzqwsmqpegpkgyzu'
        }
    });

    var mailOptions = {
        from: emailOptions.from,
        to: email,
        subject: emailOptions.subject,
        html: '<h1>CONFIRMA TU EMAIL: </h1><a href="http://localhost:4000/verify/'+verifyCode+'">CONFIRMA</a>'
    };

    let user = newUser.email + ';' + newUser.password + ';' + newUser.nombre;
    await db.query('INSERT INTO pending_usuarios (code, user) VALUES (?, ?)', [verifyCode, user]);

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            return done(null, false, req.flash('ok', 'Comprueba tu bandeja de correo'));
        }
    });

    /* return done(null, newUser); */
}));

// Login
passport.use('login', new Strategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    let user = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (user.length === 1) {
        user = user[0];
        if (await helpers.matchPass(password, user.password)) {
            done(null, user, req.flash('ok', 'Bienvenid@, '+user.nombre));
        } else {
            done(null, false, req.flash('fail', 'Contraseña incorrecta'));
        }
    } else {
        return done(null, false, req.flash('fail', 'Usuario no registrado'));
    }
}));

// Serialización y deserialización del usuario
passport.serializeUser((user, done) => {
    done(null, user.email);
});

passport.deserializeUser(async (email, done) => {
    const users = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    done(null, users[0]);
});