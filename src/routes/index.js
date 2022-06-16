// Ruta raíz //

// Carga de 'express' y 'router'
const express = require('express');
const router = express.Router();

// Renderiza la página de inicio según el estado de la sesión
router.get('/', (req,res)=>{
    if(req.user){
        res.redirect('/links');
    }else{
        res.render('users/login');
    }
});

module.exports = router;