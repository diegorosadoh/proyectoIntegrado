// Módulos
const express = require('express');
const expsession = require('express-session');
const sqlsession = require('express-mysql-session');
const exphbs = require('express-handlebars');

const flash = require('connect-flash');
const path = require('path');
const passport = require('passport');

const { database } = require('./utils');

// Conexión con la base de datos
const db = require('./database');

// Inicialización
const app = express();
require('./lib/passport');

// Localización del puerto
app.set('port', process.env.PORT || 4000);

// Localización de la carpeta de vistas
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs.engine ({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

//Middlewares
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

// Variables globales
app.use(async (req, res, next) => {
    app.locals.ok = req.flash('ok');
    app.locals.fail = req.flash('fail');
    app.locals.user = req.user;

    if(app.locals.user){
        await (async ()=>{
            app.locals.folders = await getFolders(req.user.email);
        })();
    }

    next();
});

async function getFolders(user){
    return await db.query('SELECT * FROM carpetas WHERE usuario = ?', [user]);
}

// Rutas
app.use(require('./routes'));
app.use(require('./routes/users'));
app.use('/links', require('./routes/links'));

// Arrancar servidor
app.listen(app.get('port'), ()=>{
    console.log('Servidor iniciado en el puerto', app.get('port'));
})

// Public
app.use(express.static(path.join(__dirname, 'public')));
