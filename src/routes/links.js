// Carga de módulos
const express = require('express');
const router = express.Router();

// Carga de helpers
const helpers = require('../lib/helpers');

// Conexión con la base de datos
const db = require('../database');

/* RENDERIZADO DE VISTAS */
    // Lista de links
    router.get('/', helpers.userLog, async(req, res) => {
        let links = await db.query('SELECT * FROM links WHERE usuario = ? ORDER BY fecha DESC', [req.user.email]);
        links = helpers.dateFormat(links);
        res.render('links/all', {links: links, title: 'Links'});
    });

    // Lista de links por categorias
    router.get('/categories', helpers.userLog, async(req, res) => {
        let links = await db.query('SELECT * FROM links WHERE usuario = ?', [req.user.email]);
        links = helpers.dateFormat(links);
        let cats = helpers.linkOrganizer(links);
        res.render('links/cats', {cats: cats, title: 'Categorías'});
    });

    // Añadir link
    router.get('/add', helpers.userLog, (req, res) => {
        res.render('./links/add', { data: req.cookies.newLink, title: 'Nuevo link'});
    }); 

    // Añadir link a una carpeta
    router.get('/add/:id', helpers.userLog, (req, res) => {
        res.render('./links/add', {carpeta: req.params.id, title: 'Nuevo link'});
    }); 

    // Lista de links de una carpeta
    router.get('/:id', helpers.userLog, async(req, res) => {
        let links = await db.query('SELECT * FROM links WHERE usuario = ? AND carpeta = ? ORDER BY fecha DESC', [req.user.email, req.params.id]);
        let carpeta = await db.query('SELECT * FROM carpetas WHERE id = ?', [req.params.id]);
        links = helpers.dateFormat(links);
        res.render('links/all', {links: links, carpeta: carpeta[0], title: "Links en '"+carpeta[0].nombre+"'"});
    });   

    // Editar link
    router.get('/edit/:id', helpers.userLog, async (req, res) => {
        const links = await db.query('SELECT * FROM links WHERE id = ?', [req.params.id]);
        res.render('links/edit', {links: links[0], title: "Editar '"+links[0].titulo+"'"});
    });

    // Eliminar link
    router.get('/delete/:id', helpers.userLog, async (req, res) => {
        await db.query('DELETE FROM links WHERE id = ?', [req.params.id]);
        res.redirect('/links');
    });

/* FORMULARIOS */
    // Añadir link
    router.post('/add', helpers.userLog, async (req, res) => {

        //Datos del nuevo link
        const newLink = {
            enlace: req.body.enlace,
            titulo: req.body.titulo,
            descripcion: req.body.descripcion,
            usuario: req.user.email
        }

        res.clearCookie("newLink");
        res.cookie("newLink", newLink, {maxAge: 5000});

        //Validación del formulario
        if(newLink.enlace.length < 1){
            req.flash('fail', 'Introduce un enlace');
            res.redirect('/links/add');
        } else if (newLink.titulo.length < 1){
            req.flash('fail', 'Introduce un título');
            res.redirect('/links/add');
        } else if (newLink.enlace.length > 255){
            req.flash('fail', 'Enlace demasiado largo');
            res.redirect('/links/add');
        } else if (newLink.titulo.length > 15){
            req.flash('fail', 'Título demasiado largo');
            res.redirect('/links/add');
        } else if (newLink.descripcion.length > 255){
            req.flash('fail', 'Descripción demasiado larga');
            res.redirect('/links/add');
        } else if (! newLink.enlace.match(/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g)){
            req.flash('fail', 'Formato de URL incorrecto');
            res.redirect('/links/add');
        } else if (! newLink.titulo.match(/^[a-zA-ZÁÉÍÓÚáéíóú0-9\s]*$/g)){
            req.flash('fail', 'Formato de título incorrecto');
            res.redirect('/links/add');
        } else if (! newLink.descripcion.match(/^[a-zA-ZÁÉÍÓÚáéíóú0-9\s\,\.\:]*$/g)){
            req.flash('fail', 'Formato de descripción incorrecto');
            res.redirect('/links/add');
        } else {

            //Inserción del link
            if(req.body.carpeta !== ""){
                newLink.carpeta = parseInt(req.body.carpeta);
            } else {
                newLink.carpeta = undefined;
            }

            await db.query('INSERT INTO links SET ?', [newLink]);
            req.flash('ok', 'Link añadido');
            res.redirect('/links');
        }

        
    });

    // Editar link
    router.post('/edit/:id', helpers.userLog, async (req, res) => {
        const editLink = {
            enlace: req.body.enlace,
            titulo: req.body.titulo,
            descripcion: req.body.descripcion
        }

        //Validación del formulario
        if(editLink.enlace.length < 1){
            req.flash('fail', 'Introduce un enlace');
            res.redirect('/links/edit/'+req.params.id);
        } else if (editLink.titulo.length < 1){
            req.flash('fail', 'Introduce un título');
            res.redirect('/links/edit/'+req.params.id);
        } else if (editLink.enlace.length > 255){
            req.flash('fail', 'Enlace demasiado largo');
            res.redirect('/links/edit/'+req.params.id);
        } else if (editLink.titulo.length > 15){
            req.flash('fail', 'Título demasiado largo');
            res.redirect('/links/edit/'+req.params.id);
        } else if (editLink.descripcion.length > 255){
            req.flash('fail', 'Descripción demasiado larga');
            res.redirect('/links/edit/'+req.params.id);
        } else if (! editLink.enlace.match(/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g)){
            req.flash('fail', 'Formato de URL incorrecto');
            res.redirect('/links/edit/'+req.params.id);
        } else if (! editLink.titulo.match(/^[a-zA-ZÁÉÍÓÚáéíóú0-9\s]*$/g)){
            req.flash('fail', 'Formato de título incorrecto');
            res.redirect('/links/edit/'+req.params.id);
        } else if (! editLink.descripcion.match(/^[a-zA-ZÁÉÍÓÚáéíóú0-9\s\,\.\:]*$/g)){
            req.flash('fail', 'Formato de descripción incorrecto');
            res.redirect('/links/edit/'+req.params.id);
        } else {

            // Modificación del link
            if(req.body.carpeta !== ""){
                editLink.carpeta = parseInt(req.body.carpeta);
            } else {
                editLink.carpeta = undefined;
            }

            await db.query('UPDATE links SET ? WHERE id = ?', [editLink, req.params.id]);
            res.redirect('/links');
        } 
    });

    // Añadir carpeta
    router.post('/folders/add', helpers.userLog, async (req, res) => {
        const newFolder = {
            nombre: req.body.carpeta,
            usuario: req.user.email
        }

        await db.query('INSERT INTO carpetas (nombre, usuario) VALUES (?, ?)', [newFolder.nombre, newFolder.usuario]);
        req.flash('ok', 'Carpeta creada');
        res.redirect('/links');
    });

    // Mostrar panel de confirmación para eliminar carpeta
    router.post('/folders/modal1/:id', helpers.userLog, async (req, res) => {
        let carpeta = await db.query('SELECT * FROM carpetas WHERE id = ?', [req.params.id]);
        res.render('./links/modal1', {carpeta: carpeta[0]});
    });

    // Mostrar panel de confirmación para eliminar links de una carpeta
    router.post('/folders/modal2/:id', helpers.userLog, async (req, res) => {
        let carpeta = await db.query('SELECT * FROM carpetas WHERE id = ?', [req.params.id]);
        res.render('./links/modal2', {carpeta: carpeta[0]});
    });

    // Eliminar carpeta
    router.post('/folders/delete/:id', helpers.userLog, async (req, res) => {
        await db.query('UPDATE links SET carpeta = NULL WHERE carpeta = ?', [req.params.id]);
        await db.query('DELETE FROM carpetas WHERE id = ?', [req.params.id]);
        res.redirect('/links');
    });

    // Eliminar links de una carpeta
    router.post('/folders/delete-links/:id', helpers.userLog, async (req, res) => {
        await db.query('DELETE FROM links WHERE carpeta = ?', [req.params.id]);
        res.redirect('/links/'+req.params.id);
    });

module.exports = router;