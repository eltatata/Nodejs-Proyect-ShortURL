const User = require('../models/Users');
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const {nanoid} = require('nanoid');

// leer variables de entorno
require('dotenv').config();

const resgisterForm = (req, res) => {
    res.render("register");
    // res.render("register", { errors: req.flash("error") });
}

const registerUser = async (req, res) => {
    // obtener el resultado de la validacion
    const errors = validationResult(req);

    // si hay un error o falta algun campo de validacion
    if(!errors.isEmpty()) {
        req.flash("error", errors.array());
        return res.redirect("/auth/register");
    };

    try {
        // buscar el usuario por email
        const userOnDB = await User.findOne({ email: req.body.userEmail });

        // si el usuario existe decirle que ya existe
        if (userOnDB) {
            throw new Error("El usuario ya existe");
        } else {
            // crear un nuevo usuario
            const user = new User({
                name: req.body.userName,
                email: req.body.userEmail,
                password: req.body.userPassword,
                tokenConfirm: nanoid()
            });

            // guardar el usuario en la base de datos
            await user.save();

            // mostrar en consola el usuario creado
            console.log(`usuario creado: ` + `${user}`.green);

            // config para poder mandar el correo al user
            var transport = nodemailer.createTransport({
                host: "smtp.mailtrap.io",
                port: 2525,
                auth: {
                  user: process.env.userEmail,
                  pass: process.env.passEmail
                }
            });

            // enviar correo electronico para la confirmacion de la cuenta
            await transport.sendMail({
                from: '"Fred Foo 👻" <foo@example.com>', // sender address
                to: user.email, // list of receivers
                subject: "Verfica tu cuenta de correo", // Subject line
                html: `<a href="${process.env.PATHHEROKU || "http://localhost:3000"}/auth/confirm/${user.tokenConfirm}">Verificar correo electronico</a>`, // html body
            });
            
            // no es un error en un mensaje al user            
            req.flash("error", [{ msg: "Revisa tu correo electronico y valida tu cuenta" }]);
            res.redirect("/auth/login");
        }   
    } catch (error) {
        // console.log(error);
        // res.send("Hubo un error");
        req.flash("error", [{ msg: error.message }]);
        res.redirect("/auth/register");
    }
}

const confirmAccount = async (req, res) => {
    try {
        // buscar el usuario por el token de confirmacion
        const userOnDB = await User.findOne({ tokenConfirm: req.params.token });

        // si el usuario no existe
        if (!userOnDB) throw new Error("El usuario no existe");

        // si el usuario existe cambiar el estado del usuario a true
        userOnDB.confirmedAccount = true;
        // restaurar el token de confirmacion
        userOnDB.tokenConfirm = null;

        // guardar el usuario en la base de datos
        await userOnDB.save();

        console.log(`usuario confirmado: `.green + `${userOnDB}`);

        // no es un error en un mensaje al user
        req.flash("error", [{ msg: "Cuenta confimada, puedes iniciar sesión" }]);
        res.redirect("/auth/login");
    } catch (error) {
        // console.log(error);
        // res.send("Hubo un error");
        req.flash("error", [{ msg: error.message }]);
        res.redirect("/auth/login");
    }
}

const loginForm = (req, res) => {
    res.render("login");
    // res.render("login", { errors: req.flash("error") });
}

const loginUser = async (req, res) => {
    // obtener el resultado de la validacion
    const errors = validationResult(req);
    
    // si hay un error o falta algun campo de validacion
    if(!errors.isEmpty()) {
        req.flash("error", errors.array());
        return res.redirect("/auth/login");
    };

    try {
        // buscar el usuario por email
        const userOnDB = await User.findOne({ email: req.body.userEmail });

        // si el usuario no existe
        if (!userOnDB) throw new Error("El usuario no existe");

        // verificar si la cuenta no esta confirmada
        if(!userOnDB.confirmedAccount) throw new Error("El usuario no ha confirmado su cuenta");

        // si el usuario existe verificar la contraseña
        if (!userOnDB.comparePassword(req.body.userPassword)) throw new Error("La contraseña es incorrecta");

        // crear sesion del usuario atraves de passport
        req.login(userOnDB, (err) => {
            if (err) {
                throw new Error("Error al iniciar sesión");
            } else {
                // redireccionar al usuario a la pagina principal
                res.redirect("/");
            }
        });
    } catch (error) {
        // console.log(error);
        // res.send(error.message);
        req.flash("error", [{ msg: error.message }]);
        res.redirect("/auth/login");
    }
}

// funcion para cerrar la sesion del usuario
const logoutUser = (req, res) => {
    req.logout(() => {
        try {
            // redireccionar al usuario a la pagina de inicio de sesión
            res.redirect("/auth/login");
        } catch (error) {
            console.log(error);
        }
    });
}

// exportar los metodos
module.exports = {
    resgisterForm, 
    registerUser, 
    confirmAccount,
    loginForm,
    loginUser,
    logoutUser
}