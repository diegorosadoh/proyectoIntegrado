const bcrypt = require('bcryptjs');
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
        let month = (fecha.getMonth() < 10 ? '0' : '') + fecha.getMonth();
        let year = (fecha.getFullYear() < 10 ? '0' : '') + fecha.getFullYear();

        let hour = (fecha.getHours() < 10 ? '0' : '') + fecha.getHours();
        let mins = (fecha.getMinutes() < 10 ? '0' : '') + fecha.getMinutes();

        link.fecha = day+'/'+month+'/'+year;
        link.hora = hour+':'+mins;
    });

    return links;
};

module.exports = helpers;