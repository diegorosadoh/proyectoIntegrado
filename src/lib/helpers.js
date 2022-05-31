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
        let month = (fecha.getMonth() < 10 ? '0' : '') + fecha.getMonth();
        let year = (fecha.getFullYear() < 10 ? '0' : '') + fecha.getFullYear();

        let hour = (fecha.getHours() < 10 ? '0' : '') + fecha.getHours();
        let mins = (fecha.getMinutes() < 10 ? '0' : '') + fecha.getMinutes();

        link.fecha = day+'/'+month+'/'+year;
        link.hora = hour+':'+mins;
    });

    return links;
};

helpers.linkOrganizer = (links) => {
    let cats=[], videos=[], news=[], academics=[], other=[];

    links.forEach(link => {
        if(categories.videos.some(x => link.enlace.includes(x))){
            videos.push(link);
        } else if (categories.news.some(x => link.enlace.includes(x))){
            news.push(link);
        } else if(categories.academics.some(x => link.enlace.includes(x))){
            academics.push(link);
        } else {
            other.push(link);
        }
    });

    if(videos.length > 0) cats.push({
        "cat": "Vídeos",
        "links": videos
    });
    if(news.length > 0) cats.push({
        "cat": "Noticias",
        "links": news
    });
    if(academics.length > 0) cats.push({
        "cat": "Artículos académicos",
        "links": academics
    });
    if(other.length > 0) cats.push({
        "cat": "Otros",
        "links": other
    });

    return cats;
};

module.exports = helpers;