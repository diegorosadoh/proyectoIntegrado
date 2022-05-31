// Carga de módulos
const express = require('express');
const router = express.Router();

// Página de inicio según el estado de la sesión
router.get('/', (req,res)=>{
    if(req.user){
        res.redirect('/links');
    }else{
        res.render('users/login');
    }
});

module.exports = router;