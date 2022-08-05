const User = require('../models/Users');
const formidable = require("formidable");
const jimp = require("jimp");
const fs = require("fs");
const path = require("path");

const formProfile = async (req, res) => {
    // console.log(req)
    // console.log(req.user);

    // buscar en la base de datos el user que esta logueado
    const user = await User.findById(req.user.id);
    // console.log(user);

    // pasar al user logueado y su info de la img de la DB
    res.render("profile", { user: req.user, img: user.img });
}

const editProfilePhoto = async (req, res) => {
    // console.log(req.user.id);

    const form = new formidable.IncomingForm();

    // determinar que el tamaño maximo va a hacer de 50MB
    form.maxFileSize = 50 * 1024 * 1024;

    // procesamiento de la imagen
    form.parse(req, async (err, fields, files) => {
        try {
            // saber si hubo un error en el procesamiento de la imagen
            if (err) throw new Error("Fallo el procesamiento de la imagen");

            // fields: devuelve de el csrfToken del input que esta en el form
            // console.log(fields);

            // file: devuelve el myFile el input tipo "file" que es dentro del fom
            // console.log(files);

            // VALIDACIONES:
            const file = files.myFile;

            // si el user no subio ningun archivo
            if (file.originalFilename === "") throw new Error("No se subio ningun archivo");

            // si el archivo no cumple con ninguno de las extenciones: jpg, png
            const imagesTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

            if(!imagesTypes.includes(file.mimetype)) {
                throw new Error ("por favor ingrese una imagen .jpg o .png");
            }

            // si el tamaño del archivo es mayor a 50MB
            if (file.size > 50 * 1024 * 1024) throw new Error("El tamaño es superior a 50MB");

            // a image/jpg con split("/") separar en [['image', 'jpg']] y tomar "jpg" con [1]
            const extension = file.mimetype.split("/")[1];

            // definir donde se guardara el archivo
            const dirFile = path.join(__dirname, `../public/images/profiles/${req.user.id}.${extension}`);
            console.log("Lugar donde se guardo: ".green + dirFile);  

            // guardar el archivo en el lugar indicado
            fs.renameSync(file.filepath, dirFile);

            // redimencionar y modificar la calidad de la imagen
            const image = await jimp.read(dirFile);
            image.resize(200, 200).quality(90).writeAsync(dirFile);

            // guardar en la base de datos el lugar/ruta donde se encuentra la imagen
            const user = await User.findById(req.user.id);
            user.img = `${req.user.id}.${extension}`;
            await user.save();

            req.flash("error", [{ msg: "Se subio la imagen" }]);
        } catch (error) {
            req.flash("error", [{ msg: error.message }]);
        } finally {
            return res.redirect("/profile");
        }
    });
}

module.exports = {
    formProfile,
    editProfilePhoto
}