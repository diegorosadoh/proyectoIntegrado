// Fichero base //

// Carga de módulos
const express = require('express');
const expsession = require('express-session');
const sqlsession = require('express-mysql-session');
const exphbs = require('express-handlebars');

const flash = require('connect-flash');
const path = require('path');
const passport = require('passport');
const cookieParser = require('cookie-parser');

// Carga del fichero de 'passport'
require('./lib/passport');

// Carga de la configuración de la base de datos
const { database } = require('./utils');

// Conexión con la base de datos
const db = require('./database');

// Inicialización de 'express'
const app = express();

// Configuración del puerto
app.set('port', process.env.PORT || 4000);

// Configuración de las vistas (mediante 'handlebars')
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs.engine ({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs'
}));
app.set('view engine', '.hbs').use(express.static(path.join(__dirname, '/public')));

//Inicialización y configuración de middlewares
app.use(expsession({
    secret: 'proyectosession',
    resave: false,
    saveUninitialized: false,
    store: new sqlsession(database)
}));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(cookieParser());

// Variables globales
app.use(async (req, res, next) => {
    app.locals.user = req.user; // Usuario

    if(app.locals.user){
        await (async ()=>{
            app.locals.folders = await getFolders(req.user.email); // Carpetas del usuario
        })();
    }

    app.locals.ok = req.flash('ok'); // Mensaje OK
    app.locals.fail = req.flash('fail'); // Mensaje de error

    next();
});

// Función que recupera las carpetas del usuario
async function getFolders(user){
    return await db.query('SELECT * FROM carpetas WHERE usuario = ?', [user]);
}

// Rutas
app.use(require('./routes'));
app.use(require('./routes/users'));
app.use('/links', require('./routes/links'));
app.use('*', require('./routes/error'));

// Arranque del servidor
app.listen(app.get('port'), ()=>{
    console.log('Servidor iniciado en el puerto', app.get('port'));
});

// Directorio public
app.use(express.static(path.join(__dirname, 'public')));