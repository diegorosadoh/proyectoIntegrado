// Funciones auxiliares //

// Carga de 'bcryptjs'
const bcrypt = require('bcryptjs');

// Carga del fichero JSON con las categorías
const categories = require('./categories.json');

const helpers = {};

/**
 * Continúa la ejecución si el usuario está registrado,
 * de otro modo le redirige a la pantalla de login
 */
helpers.userLog = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    };

    return res.redirect('/login');
};

/**
 * Cifra una contraseña mediante una función de hashing
 * @param {String} password - Contraseña a cifrar
 * @returns {String} - Contraseña cifrada
 */
helpers.encrypt = async (password) => {
    return bcrypt.hash(password, await bcrypt.genSalt(5));
};

/**
 * Compara dos contraseñas
 * @param {String} password - Contraseña 1
 * @param {String} originalPassword - Contraseña 2
 * @returns {boolean} - Devuelve true si las contraseñas coinciden
 */
helpers.matchPass = async (password, originalPassword) => {
    try{
        return await bcrypt.compare(password, originalPassword);
    } catch(e) {
        console.log(e);
    }
};

/**
 * Hace legible la fecha de una lista de links
 * @param {Array} links - Lista de links a formatear
 * @returns {Array} - Lista de links con la fecha formateada
 */
helpers.dateFormat = (links) => {
    links.forEach(link => {
        let fecha = link.fecha;

        let day = (fecha.getDate() < 10 ? '0' : '') + fecha.getDate();
        let month = ((fecha.getMonth()+1) < 10 ? '0' : '') + (fecha.getMonth()+1);
        let year = (fecha.getFullYear() < 10 ? '0' : '') + fecha.getFullYear();

        let hour = ((fecha.getHours()+2) < 10 ? '0' : '') + (fecha.getHours()+2);
        let mins = (fecha.getMinutes() < 10 ? '0' : '') + fecha.getMinutes();

        link.fecha = day+'/'+month+'/'+year;
        link.hora = hour+':'+mins;
    });

    return links;
};

/**
 * Organiza una lista de links según su URL contenga alguna de
 * las páginas contenidas en el archivo JSON de categorías
 * @param {Array} links - Lista de links a organizar
 * @returns {Array} - Lista de links organizada
 */
helpers.linkOrganizer = (links) => {
    let cats=[];

    Object.keys(categories).forEach((key) => {
        cats.push({
            "cat": categories[key][0],
            "links": []
        });
    });

    cats.push({
        "cat": "Otros",
        "links": []
    });

    links.forEach(link => {
        let asignado = false;

        Object.keys(categories).forEach((key) => {
            let nombre = categories[key][0];
            let lista = categories[key][1];
            for (const i in cats) { if(cats[i].cat == nombre){ var array = i }; }
            
            if(!asignado){
                lista.forEach(pagina => {
                    if (link.enlace.includes(pagina)){
                        cats[array].links.push(link);
                        asignado = true;
                    };
                });
            }
        });

        if(!asignado){ cats.at(-1).links.push(link); }
    });
    
    return cats;
};

module.exports = helpers;