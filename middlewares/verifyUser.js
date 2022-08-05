// funcion para saber si el usuario tiene su sesion activa

const verifyUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", [{ msg: "No has iniciado sesion" }]);
    res.redirect("/auth/login");
}

module.exports = verifyUser;