/**
 * Archivo para la gestión del registro
 * y login de los usuarios.
 */

// Carga de passport
const passport = require('passport');
const Strategy = require('passport-local').Strategy;

// Carga de nodemailer
const nodemailer = require('nodemailer');

// Conexión con la base de datos
const db = require('../database');

// Helpers
const helpers = require('../lib/helpers');

// Configuración del envío de correo
const { emailOptions } = require('../utils');

// Registro
passport.use('register', new Strategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {

    // Datos del nuevo usuario
    newUser = {
        email: email,
        password: password,
        nombre: req.body.nombre
    };

    // Validación del formulario
    if(newUser.nombre.length < 1){
        return done(null, false, req.flash('fail', 'Introduce un nombre'));
    } else if(newUser.email.length < 1){
        return done(null, false, req.flash('fail', 'Introduce un email'));
    } else if(newUser.password.length < 1){
        return done(null, false, req.flash('fail', 'Introduce una contraseña'));
    } else if(req.body.password2.length < 1){
        return done(null, false, req.flash('fail', 'Repite la contraseña'));
    }else if (! newUser.nombre.match(/([A-Za-zÁÉÍÓÚáéíóú\s])+/g)){
        return done(null, false, req.flash('fail', 'Formato de nombre incorrecto'));
    }else if (! newUser.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)){
        return done(null, false, req.flash('fail', 'Formato de email incorrecto'));
    } else if (newUser.email.length > 255){
        return done(null, false, req.flash('fail', 'Email demasiado largo'));
    } else if (newUser.nombre.length > 40){
        return done(null, false, req.flash('fail', 'Nombre demasiado largo'));
    } else if (newUser.password !== req.body.password2){
        return done(null, false, req.flash('fail', 'Las contraseñas no coinciden'));
    } else if (newUser.password.length < 8){
        return done(null, false, req.flash('fail', 'Contraseña demasiado corta'));
    }

    // Comprobación de que el email aún no está registrado
    let duplicate = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (duplicate.length > 0){
        return done(null, false, req.flash('fail', 'Email ya registrado'));
    }

    // Cifrado de la contraseña
    newUser.password = await helpers.encrypt(password);

    // Código para la verificación del registro
    let verifyCode = await helpers.encrypt(email);
    verifyCode = verifyCode.replaceAll('/','').replaceAll(';','');

    // Datos del remitente para el envío del correo
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailOptions.from,
            pass: emailOptions.auth
        }
    });

    // Datos del destinatario y del contenido del correo
    var mailOptions = {
        from: emailOptions.from,
        to: email,
        subject: emailOptions.subject,
        /*
            http://localhost:4000
            https://link-organizer-proyecto.herokuapp.com
        */
        html: `
            <h1 style="
                text-align:center; 
                font-size:32px; 
                text-transform:uppercase; 
                letter-spacing:1px;
                font-weight:500;
                color:#F69094;
                text-shadow: 1px 1px 1px #754547;
                margin: 5px;
            ">
                LINKIN
            </h1>
            <div style="
                width: 50%;
                border: 1px solid black;
                padding: 20px 15px;
                font-size: 16px;
                margin: 0 auto;
                border-radius: 15px;
                background-color: #f1f1f1;
                text-align: center;
            ">
                <p>
                    ¡Hola <strong>${newUser.nombre}</strong>!
                </p>

                <p>
                    Sigue el siguiente enlace para verificar tu cuenta y empezar a utilizar 
                    <span style="
                        color: #754547;
                    ">
                        Linkin
                    </span>:
                </p>

                <a style="
                    font-size: 20px;
                    color: #754547;
                    background-color: #F7DBDC;
                    padding: 8px 15px;
                    border-radius: 20px;
                    box-shadow: 0 5px 15px #756869;
                    cursor: pointer;
                    text-decoration: none;
                    text-align: center;
                " 
                href="https://link-organizer-proyecto.herokuapp.com/verify/${verifyCode}">
                    Verificar cuenta
                </a>
            </div>`
    };

    // Inserción del nuevo usuario en la tabla de usuarios por verificar
    let user = newUser.email + ';' + newUser.password + ';' + newUser.nombre;
    await db.query('INSERT INTO pending_usuarios (code, user) VALUES (?, ?)', [verifyCode, user]);

    //Envío del correo
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log(info);
            return done(null, false, req.flash('ok', 'Comprueba tu bandeja de correo'));
        }
    });
}));

// Login
passport.use('login', new Strategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {

    // Validación del formulario
    if(email.length < 1){
        return done(null, false, req.flash('fail', 'Introduce un email'));
    } else if (password.length < 1){
        return done(null, false, req.flash('fail', 'Introduce una contraseña'));
    } else if (! email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)){
        return done(null, false, req.flash('fail', 'Formato de email incorrecto'));
    }

    // Extracción del usuario
    let user = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    // Comprobación de la contraseña
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

// Serialización del usuario
passport.serializeUser((user, done) => {
    done(null, user.email);
});

// Deserialización del usuario
passport.deserializeUser(async (email, done) => {
    const users = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    done(null, users[0]);
});