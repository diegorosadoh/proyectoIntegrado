// Carga de módulos
const express = require('express');
const router = express.Router();
const helpers = require('../lib/helpers');

// Conexión con la base de datos
const db = require('../database');
const { userLog } = require('../lib/helpers');

// Renderizado de vistas
    // Lista de links
router.get('/', helpers.userLog, async(req, res) => {
    let links = await db.query('SELECT * FROM links WHERE usuario = ?', [req.user.email]);
    links = helpers.dateFormat(links);
    res.render('links/all', {links: links});
});

// Añadir link
router.get('/add', helpers.userLog, (req, res) => {
    res.render('./links/add');
}); 

router.get('/:id', helpers.userLog, async(req, res) => {
    let links = await db.query('SELECT * FROM links WHERE usuario = ? AND carpeta = ?', [req.user.email, req.params.id]);
    links = helpers.dateFormat(links);
    res.render('links/all', {links: links});
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

// Formularios
    // Añadir link
router.post('/add', helpers.userLog, async (req, res) => {
    const newLink = {
        enlace: req.body.enlace,
        titulo: (req.body.titulo) ? req.body.titulo : req.body.enlace,
        descripcion: req.body.descripcion,
        usuario: req.user.email
    }

    if(Number.isInteger(req.body.carpeta)) newLink.carpeta = req.body.carpeta;

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

    if(Number.isInteger(req.body.carpeta)) newLink.carpeta = req.body.carpeta;

    await db.query('UPDATE links SET ? WHERE id = ?', [editLink, req.params.id]);
    res.redirect('/links');
});

    //Añadir carpeta
router.post('/folders', helpers.userLog, async (req, res) => {
    const newFolder = {
        nombre: req.body.carpeta,
        usuario: req.user.email
    }

    await db.query('INSERT INTO carpetas (nombre, usuario) VALUES (?, ?)', [newFolder.nombre, newFolder.usuario]);
    req.flash('ok', 'Carpeta creada');
    res.redirect('/links');
});

module.exports = router;