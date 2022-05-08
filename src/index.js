// Módulos
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const expsession = require('express-session');
const sqlsession = require('express-mysql-session');
const passport = require('passport');

const { database } = require('./utils');

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
}))
app.use(flash());
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// Variables globales
app.use((req, res, next) => {
    app.locals.ok = req.flash('ok');
    app.locals.fail = req.flash('fail');
    app.locals.user = req.user;
    next();
})

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