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
    let links = await db.query('SELECT * FROM links WHERE usuario = ?', [req.user.email]);
    links = helpers.dateFormat(links);
    res.render('links/all', {links: links});
});

// Lista de links por categorias
router.get('/categories', helpers.userLog, async(req, res) => {
    let links = await db.query('SELECT * FROM links WHERE usuario = ?', [req.user.email]);
    links = helpers.dateFormat(links);
    let cats = helpers.linkOrganizer(links);
    res.render('links/cats', {cats: cats});
});

// Añadir link
router.get('/add', helpers.userLog, (req, res) => {
    res.render('./links/add');
}); 

// Añadir link a una carpeta
router.get('/add/:id', helpers.userLog, (req, res) => {
    res.render('./links/add', {carpeta: req.params.id});
}); 

//Lista de links de una carpeta
router.get('/:id', helpers.userLog, async(req, res) => {
    let links = await db.query('SELECT * FROM links WHERE usuario = ? AND carpeta = ?', [req.user.email, req.params.id]);
    let carpeta = await db.query('SELECT * FROM carpetas WHERE id = ?', [req.params.id]);
    links = helpers.dateFormat(links);
    res.render('links/all', {links: links, carpeta: carpeta[0]});
});   

// Editar link
router.get('/edit/:id', helpers.userLog, async (req, res) => {
    const links = await db.query('SELECT * FROM links WHERE id = ?', [req.params.id]);
    res.render('links/edit', {links: links[0]});
});

//Eliminar link
router.get('/delete/:id', helpers.userLog, async (req, res) => {
    await db.query('DELETE FROM links WHERE id = ?', [req.params.id]);
    res.redirect('/links');
});



/* FORMULARIOS */
// Añadir link
router.post('/add', helpers.userLog, async (req, res) => {
    const newLink = {
        enlace: req.body.enlace,
        titulo: (req.body.titulo) ? req.body.titulo : req.body.enlace,
        descripcion: req.body.descripcion,
        usuario: req.user.email
    }

    if(req.body.carpeta !== "") newLink.carpeta = parseInt(req.body.carpeta);

    await db.query('INSERT INTO links SET ?', [newLink]);
    req.flash('ok', 'Link añadido');
    res.redirect('/links');
});

// Editar link
router.post('/edit/:id', helpers.userLog, async (req, res) => {
    const editLink = {
        enlace: req.body.enlace,
        titulo: req.body.titulo,
        descripcion: req.body.descripcion
    }

    if(req.body.carpeta !== "") newLink.carpeta = parseInt(req.body.carpeta);

    await db.query('UPDATE links SET ? WHERE id = ?', [editLink, req.params.id]);
    res.redirect('/links');
});

//Añadir carpeta
router.post('/folders/add', helpers.userLog, async (req, res) => {
    const newFolder = {
        nombre: req.body.carpeta,
        usuario: req.user.email
    }

    await db.query('INSERT INTO carpetas (nombre, usuario) VALUES (?, ?)', [newFolder.nombre, newFolder.usuario]);
    req.flash('ok', 'Carpeta creada');
    res.redirect('/links');
});

//Eliminar carpeta
router.post('/folders/delete/:id', helpers.userLog, async (req, res) => {
    await db.query('UPDATE links SET carpeta = NULL WHERE carpeta = ?', [req.params.id]);
    await db.query('DELETE FROM carpetas WHERE id = ?', [req.params.id]);
    res.redirect('/links');
});

module.exports = router;