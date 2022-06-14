const bcrypt = require('bcryptjs');
const categories = require('./categories.json');

const helpers = {};

helpers.userLog = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    };

    return res.redirect('/login');
};

helpers.encrypt = async (password) => {
    return bcrypt.hash(password, await bcrypt.genSalt(5));
};

helpers.matchPass = async (password, originalPassword) => {
    try{
        return await bcrypt.compare(password, originalPassword);
    } catch(e) {
        console.log(e);
    }
};

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