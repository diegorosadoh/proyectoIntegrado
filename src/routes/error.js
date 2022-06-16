// Ruta no contemplada //

// Carga de 'express' y 'router'
const express = require('express');
const router = express.Router();

// Renderización de la vista de error
router.get('/*', (req, res) => {
    res.render('error');
});

module.exports = router;