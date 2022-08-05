// importar el modelo Url y nanoid
const Url = require('../models/Urls');
const {nanoid} = require("nanoid");

// funcion para leer las urls de la base de datos
const readUrls = async (req, res) => {
    // console.log(req.user.id);

    // traer todas las urls de la base de datos
    try {
        // traer todas las urls de la base de datos
        const urls = await Url.find({user: req.user.id}).lean();

        console.log(urls);

        // renderizar la vista / renderizar pagina, enviarle el objeto urls
        res.render("home", { urls });
    } catch (error) {
        req.flash("error", [{ msg: error.message }]);
        res.redirect("/");
    }
}

// crear funcionar para crear una nueva url
const createUrl = async (req, res) => {
    // console.log(req.user.id)

    try {
        // crear una nueva url
        const url = new Url({
            origin: req.body.origin,
            shortUrl: nanoid(8),
            user: req.user.id
        });

        // guardar la url en la base de datos
        await url.save();

        req.flash("error", [{msg: "Url creada"}]);

        // redireccionar a la pagina de home
        res.redirect("/");

        console.log(`url creada: ` + `${url}`.green);
    } catch (error) {
        req.flash("error", [{ msg: error.message }]);
        res.redirect("/");
    }
}

// funcion para eliminar una url
const deleteUrl = async (req, res) => {
    // console.log(req.user.id)

    try {
        // eliminar la url de la base de datos
        // await Url.findByIdAndDelete(req.params.id);

        const url = await Url.findById(req.params.id);

        // saber si el usuario es el propietario de esa url
        if (!url.user.equals(req.user.id)) {
            throw new Error("No eres propietario de esa URL");
        }

        // eliminar URL
        await url.remove(); 
        req.flash("error", [{ msg: "URL eliminada" }]);

        // redireccionar a la pagina de home
        res.redirect("/");
    } catch (error) {
        req.flash("error", [{ msg: error.message }]);
        res.redirect("/");
    }
}

// funcion para abrir el formulario de edicion de url
const updateUrlForm = async (req, res) => {
    // console.log(req.user.id)

    try {
        // obtener la url de la base de datos
        const url = await Url.findById(req.params.id).lean();
        // mostrar en consola la url
        console.log(`url a editar: ` + `${url.origin}`.yellow);

        // saber si el usuario es el propietario de esa url
        if (!url.user.equals(req.user.id)) {
            throw new Error("No eres propietario de esa URL");
        }

        // renderizar la vista / renderizar pagina, enviarle el objeto url
        res.render("home", { url });

    } catch (error) {
        req.flash("error", [{ msg: error.message }]);
        res.redirect("/");
    }
}

// funcion para editar / actualizar una url
const updateUrl = async (req, res) => {
    // console.log(req.user.id)

    try {
        const url = await Url.findById(req.params.id);

        // saber si el usuario es el propietario de esa url
        if (!url.user.equals(req.user.id)) {
            throw new Error("No eres propietario de esa URL");
        }

        // // modificar la url de la base de datos
        // await Url.findByIdAndUpdate(req.params.id, {
        //     origin: req.body.origin,
        // });

        // // modificar la url de la base de datos
        await url.updateOne({origin: req.body.origin});
        req.flash("error", [{ msg: "URL editada" }]);

        // redireccionar a la pagina de home
        res.redirect("/");
    } catch (error) {
        req.flash("error", [{ msg: error.message }]);
        res.redirect("/");
    }
}

const redireccionar = async (req, res) => {
    const { shortURL } = req.params;
    
    try {
        const urlDB = await Url.findOne({ shortUrl: shortURL });
        console.log(`url redireccionada: ` + `${urlDB.origin}`.green);
        res.redirect(urlDB.origin);
    } catch (error) {
        req.flash("error", [{ msg: "No se hallo la URL" }]);
        res.redirect("/auth/login");
    }
};


// exportar la funciones
module.exports = {
    readUrls,
    createUrl, 
    deleteUrl, 
    updateUrlForm,
    updateUrl, 
    redireccionar
};