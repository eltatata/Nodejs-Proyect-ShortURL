// PROYECTO SHORTURL

const express = require('express');
const session = require('express-session');
const MongoStore = require("connect-mongo");
const mongoSanitize = require('express-mongo-sanitize');
const cors = require("cors");
const flash = require('connect-flash');
const passport = require('passport');
const csrf = require("csurf");
const { create } = require("express-handlebars");
const User = require('./models/Users');
const app = express();

// leer variables de entorno
require('dotenv').config();
// leer conexion a la base de datos
const clientDB = require("./database/db");

// midlewares
app.use(cors());

const corsOptions = {
    credentials: true,
    origin: process.env.PATHHEROKU || "*",
    methods: ['GET', 'POST']
}

// configurar/utilizar sessiones
app.set("trust proxy", 1);
app.use(
    session({
        secret: process.env.SECRETSESSION,
        resave: false,
        saveUninitialized: false,
        name: "session-user",
        store: MongoStore.create({
            clientPromise: clientDB,
            dbName: process.env.DBNAME,
        }),
        cookie: { secure: true, maxAge: 30 * 24 * 60 * 60 * 1000 },
    })
);

// configurar/utilizar flash (para mandar alertas)
app.use(flash());

// funcion para crear la session
passport.serializeUser((user, done) => {
    done(null, { id: user._id, name: user.name, email: user.email });
});

// funcion para cuando se actualiza la session
passport.deserializeUser(async (user, done) => {
    // verificar si el usuario existe
    const userOnDB = await User.findById(user.id);

    return done(null, { id: userOnDB._id, name: userOnDB.name, email: userOnDB.email });
});

// configurar/utilizar passpor
app.use(passport.initialize());
app.use(passport.session());



// linea para decir que la extension de las plantillas es .hbs
// y que trabaje con partials con la carpeta "views/components"
const hbs = create({
    extname: ".hbs",
    partialsDir: ["views/components"]
});

// lineas de configuracion de express handlebars

// motor de plantillas
app.engine(".hbs", hbs.engine);
// extension de las plantillas
app.set("view engine", ".hbs");
// carpeta donde estan las plantillas
app.set("views", "./views");


// leer el body de la peticion
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// hablilitar las protecciones
app.use(csrf());
app.use(mongoSanitize());

app.use((req, res, next) => {
    // crear token de proteccion de forma global 
    res.locals.csrfToken = req.csrfToken();
    res.locals.errors = req.flash("error");
    next();
});

// usar el router de home.js y login.js
app.use('/', require('./routes/home'));
app.use('/auth', require('./routes/auth'));

// para que se pueda acceder a la carpeta public y a la pagina estatica
app.use(express.static(__dirname + '/public'));

// configuracion de puerto
const PORT = process.env.PORT || 3000;
// escuchar el servidor
app.listen(PORT, () => {
    console.log(`server in: http://localhost:${PORT}`);
});