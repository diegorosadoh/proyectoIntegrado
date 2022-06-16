// Rutas para la gestión de usuarios //

// Carga de 'express' y 'router'
const express = require('express');
const router = express.Router();

// Carga de 'passport'
const passport = require('passport');

// Carga de 'nodemailer'
const nodemailer = require('nodemailer');

// Carga de las funciones auxiliares
const helpers = require('../lib/helpers');

// Conexión con la base de datos
const db = require('../database');

// Configuración del envío de correo
const { emailOptions } = require('../utils');

/* RENDERIZADO DE VISTAS */
    // Registro
    router.get('/register', (req, res) => {
        res.render('users/register', {title: 'Registro'});
    });

    // Login
    router.get('/login', (req, res) => {
        res.render('users/login', {title: 'Login'});
    });

    // Logout
    router.get('/logout', (req, res) => {
        res.clearCookie("editUser");
        res.clearCookie("newLink");

        req.logOut();
        res.redirect('/login');
    });

    // Perfil
    router.get('/profile', helpers.userLog, async (req, res) => {
        let links = await db.query('SELECT count(1) as count FROM links WHERE usuario = ?', [req.user.email]);
        res.render('users/profile', {links: links[0].count, data: req.cookies.editUser, title: 'Mi perfil'});
    });

    // Verificar email
    router.get('/verify/:code', async (req, res) => {
        let pendingUser = await db.query('SELECT * FROM pending_usuarios WHERE code = ?', [req.params.code]);

        if (pendingUser.length === 1) {
            pendingUser = pendingUser[0];
            let newUser = pendingUser.user.split(";");
            await db.query('INSERT INTO usuarios (email, password, nombre) VALUES (?);', [newUser]);
            await db.query('DELETE FROM pending_usuarios WHERE code = ?', [req.params.code]);

            req.flash('ok', 'Cuenta verificada');
            res.redirect('/login');
        } else {
            req.flash('fail', 'Error en la verificación');
            res.redirect('/register');
        }
    });

    // Contraseña olvida
    router.get('/forgot', async (req, res) => {
        res.render('users/forgot', {title: 'Contraseña olvidada'});
    });

    // Cambio de contraseña
    router.get('/repassword/:code', async (req, res) => {
        let pendingUser = await db.query('SELECT * FROM pending_usuarios WHERE code = ?', [req.params.code]);

        if (pendingUser.length === 1) {
            pendingUser = pendingUser[0];
            let email = pendingUser.user;
            res.render('users/repassword', {email: email, title: 'Cambio de contraseña'})
        } else {
            req.flash('fail', 'Error en la recuperación de contraseña');
            res.redirect('/forgot');
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

    // Editar usuario
    router.post('/profile', helpers.userLog, async (req, res) => {

        // Nuevos datos del usuario
        let editUser = {};
        let errors = false;

        // Cookie con los datos del usuario
        res.clearCookie("editUser");
        res.cookie("editUser", req.body.nombre, {maxAge: 5000});

        // Validación del formulario
        if (req.body.nombre.length > 0){
            if (req.body.nombre.length > 20){
                req.flash('fail', 'Nombre demasiado largo');
                errors = true;
                res.redirect('/profile');
            } else if (! req.body.nombre.match(/([A-Za-zÁÉÍÓÚáéíóú\s])+/g)){
                req.flash('fail', 'Formato de nombre incorrecto');
                errors = true;
                res.redirect('/profile');
            } else {
                editUser.nombre = req.body.nombre;
            }
        }

        if (req.body.password.length > 0 && !errors){
            if (req.body.password2.length < 1){
                req.flash('fail', 'Repite la contraseña');
                errors = true;
                res.redirect('/profile');
            } else if (req.body.password !== req.body.password2){
                req.flash('fail', 'Las contraseñas no coinciden');
                errors = true;
                res.redirect('/profile');
            } else if (req.body.password.length < 8){
                req.flash('fail', 'Contraseña demasiado corta');
                errors = true;
                res.redirect('/profile');
            } else {
                // Cifrado de la contraseña
                editUser.password = await helpers.encrypt(req.body.password);
            }
        }
      
        // Modificación del nombre
        if(editUser.nombre !== undefined && !errors){
            await db.query('UPDATE usuarios SET nombre = ? WHERE email = ?', [editUser.nombre, req.user.email]);
        }

        // Modificación de la contraseña
        if(editUser.password !== undefined && !errors){
            await db.query('UPDATE usuarios SET password = ? WHERE email = ?', [editUser.password, req.user.email]);
        }

        // Redirección
        if(!errors){
            if(editUser.nombre !== undefined && editUser.password !== undefined) {
                req.flash('ok', 'Nombre y contraseña modificados');
                res.redirect('/profile');
            } else if (editUser.nombre !== undefined) {
                req.flash('ok', 'Nombre modificado');
                res.redirect('/profile');
            } else {
                req.flash('ok', 'Contraseña modificada');
                res.redirect('/profile');
            }
        } 
    });

    // Contraseña olvidada
    router.post('/forgot', async (req, res) => {

        // Código para la recuperación de la contraseña
        let verifyCode = await helpers.encrypt(req.body.email);
        verifyCode = verifyCode.replaceAll('/','').replaceAll(';','');

        // Inserción del nuevo usuario en la tabla de usuarios por verificar
        await db.query('INSERT INTO pending_usuarios (code, user) VALUES (?, ?)', [verifyCode, req.body.email]);

        // Cookie para el email del usuario
        res.clearCookie("newPassword");
        res.cookie("newPassword", [req.body.email, verifyCode]);

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
            to: req.body.email,
            subject: "Recupera tu contraseña - LINKIN",
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
                    width: 80%;
                    border: 1px solid black;
                    padding: 20px 15px;
                    font-size: 16px;
                    margin: 0 auto;
                    border-radius: 15px;
                    background-color: #f1f1f1;
                    text-align: center;
                ">

                    <p>
                        Sigue el siguiente enlace para cambiar tu contraseña de 
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
                    href="https://link-organizer-proyecto.herokuapp.com/repassword/${verifyCode}">
                        Cambiar contraseña
                    </a>
                </div>`
        };

        //Envío del correo
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                req.flash('ok', 'Comprueba tu bandeja de correo');
                res.redirect('/forgot');
            }
        });
    });

    // Cambiar contraseña
    router.post('/repassword', async (req, res) => {

        // Validación del formulario
        if(req.body.password.length > 0){
            if (req.body.password2.length < 1){
                req.flash('fail', 'Repite la contraseña');
                res.redirect(`/repassword/${req.cookies.newPassword[1]}`);
            } else if (req.body.password !== req.body.password2){
                req.flash('fail', 'Las contraseñas no coinciden');
                res.redirect(`/repassword/${req.cookies.newPassword[1]}`);
            } else if (req.body.password.length < 8){
                req.flash('fail', 'Contraseña demasiado corta');
                res.redirect(`/repassword/${req.cookies.newPassword[1]}`);
            } else {
                // Cifrado de la contraseña
                newPassword = await helpers.encrypt(req.body.password);

                // Modificación de la contraseña
                await db.query('UPDATE usuarios SET password = ? WHERE email = ?', [newPassword, req.cookies.newPassword[0]]);
                await db.query('DELETE FROM pending_usuarios WHERE code = ?', [req.cookies.newPassword[1]]);
                res.clearCookie("newPassword");
                req.flash('ok', 'Contraseña actualizada');
                res.redirect('/login');
            }
        } else{
            req.flash('fail', 'Introduce una contraseña');
            res.redirect(`/repassword/${req.cookies.newPassword[1]}`);
        }
    });

module.exports = router;