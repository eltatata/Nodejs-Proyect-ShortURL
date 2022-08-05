const mongoose = require('mongoose');
// bcryptjs es una libreria que nos permite encriptar contraseñas
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        lowercase: true,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: {unique: true}
    },
    password: {
        type: String,
        required: true
    },
    tokenConfirm: {
        type: String,
        default: null,
        // required: true
    },
    confirmedAccount: {
        type: Boolean,
        default: false
    },
    img: {
        type: String,
        default: null
    }
});

// // metodo para encriptar la contraseña | bluuweb
// userSchema.pre("save", async function(next) {
//     const user = this;
//     if (user.isModified('password')) return next();

//     try {
//         const salt = await bcrypt.genSalt(10);
//         const hash = await bcrypt.hash(user.password, salt);
//         user.password = hash;
//         next();
//     } catch (error) {
//         console.log(error);
//         next();
//     }
// });

// // metodo para encriptar la contraseña | copilot
userSchema.pre('save', function(next) {
    const user = this;
    if (user.isModified('password')) {
        bcrypt.genSalt(10, function(err, salt) {
            if (err) return next(err);

            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return next(err);
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

userSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

const User = mongoose.model('User', userSchema);

module.exports = User;