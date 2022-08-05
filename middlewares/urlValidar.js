const {url} = require('url');

// funcion para validar la url
const urlValidar = (req, res, next) => {    
    try {
        const urlFrontend = new URL(req.body.origin);

        // sacar el dominio de la url
        if (urlFrontend.origin !== "null") {
            // si la url es valida
            if ( urlFrontend.protocol === "http:" || urlFrontend.protocol === "https:") {
                // si la url tiene un dominio
                return next();
            }
            throw new Error("Debe de tener https://");
        }
    } catch (error) {
        req.flash("error", [{ msg: error.message }]);
        return res.redirect("/");
    }
};

// exportar la funcion urlValidar
module.exports = urlValidar;