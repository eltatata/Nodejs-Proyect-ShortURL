// EXPRESS ROUTER

const express = require('express');
const { body } = require("express-validator");

// importar l a funcion readUrls de homecontroller.js
const {readUrls, createUrl, deleteUrl, updateUrl, updateUrlForm, redireccionar} = require('../controllers/homeController');
const { formProfile, editProfilePhoto } = require('../controllers/profileControlller');

// utilizar express router
const router = express.Router();

// importar los middlewares personalizados
const urlValidar = require('../middlewares/urlValidar');
const verifyUser = require('../middlewares/verifyUser');

// verifyUser para que solo los usuarios registrados puedan ver la pagina de inicio
router.get('/', verifyUser, readUrls);
router.post("/", verifyUser, urlValidar, createUrl); // urlValidar pasa saber si la url es valida
router.get("/eliminar/:id", verifyUser, deleteUrl);
router.get("/editar/:id", verifyUser, updateUrlForm);; 
router.post("/editar/:id", verifyUser, urlValidar, updateUrl); // urlValidar pasa saber si la url es valida

// router de la ruta del perfil
router.get("/profile", verifyUser, formProfile);
router.post("/profile", verifyUser, editProfilePhoto);

// ruta de redireccionamiento cuando se pasa el parametro de /:shotUrl
router.get("/:shortURL", redireccionar);

// exportar router
module.exports = router;