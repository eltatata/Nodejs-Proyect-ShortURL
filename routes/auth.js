// EXPRESS ROUTER

// en la ruta login se va a renderizar login.hbs
const express = require("express");
const { body } = require("express-validator");
const { loginForm, resgisterForm, registerUser, confirmAccount, loginUser, logoutUser } = require("../controllers/authController");
// utilizar express router
const router = express.Router();

router.get('/register', resgisterForm);
router.post("/register", [
    body("userName", "Name is invalid").trim().notEmpty().escape(),
    body("userEmail", "Email is invalid").trim().isEmail().normalizeEmail(),
    body("userPassword", "Password is invalid").trim().isLength({ min: 6 }).escape().custom((value, { req }) => {
        if (value !== req.body.userPasswordConfirmation) {
            throw new Error("Password confirmation is incorrect");
        } else {
            return value;
        }
    }),
], registerUser);
router.get("/confirm/:token", confirmAccount);
router.get('/login', loginForm);
router.post('/login',[
    body("userEmail", "Email is invalid").trim().isEmail().normalizeEmail(),
    body("userPassword", "Password is invalid").trim().isLength({ min: 6 }).escape(),
], loginUser);
router.get('/logout', logoutUser);


module.exports = router;