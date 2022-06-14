// Carga de express y router
const express = require('express');
const router = express.Router();

// Carga de passport
const passport = require('passport');

// Helpers
const helpers = require('../lib/helpers');

// Conexión con la base de datos
const db = require('../database');

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

        res.clearCookie("editUser");
        res.cookie("editUser", req.body.nombre, {maxAge: 5000});

        // Validación del formulario
        if (req.body.nombre.length > 0){
            if (req.body.nombre.length > 40){
                req.flash('fail', 'Nombre demasiado largo');
                res.redirect('/profile');
            } else if (! req.body.nombre.match(/([A-Za-zÁÉÍÓÚáéíóú\s])+/g)){
                req.flash('fail', 'Formato de nombre incorrecto');
                res.redirect('/profile');
            } else {
                editUser.nombre = req.body.nombre;

                if (editUser.nombre !== undefined || ! req.body.nombre.length > 0){
                    if (req.body.password.length > 0){
                        if (req.body.password2.length < 1){
                            req.flash('fail', 'Repite la contraseña');
                            res.redirect('/profile');
                        } else if (req.body.password !== req.body.password2){
                            req.flash('fail', 'Las contraseñas no coinciden');
                            res.redirect('/profile');
                        } else if (req.body.password.length < 8){
                            req.flash('fail', 'Contraseña demasiado corta');
                            res.redirect('/profile');
                        } else {
                            // Cifrado de la contraseña
                            editUser.password = await helpers.encrypt(req.body.password);

                            if(editUser.nombre !== undefined){
                                await db.query('UPDATE usuarios SET nombre = ? WHERE email = ?', [editUser.nombre, req.user.email]);
                            }
                    
                            if(editUser.password !== undefined){
                                await db.query('UPDATE usuarios SET password = ? WHERE email = ?', [editUser.password, req.user.email]);
                            }
                    
                            if(editUser.nombre !== undefined && editUser.password !== undefined){
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
                    }
                }
            }
        }

        

        
    });

module.exports = router;