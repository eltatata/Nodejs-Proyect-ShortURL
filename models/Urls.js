// importar mongoose, el objeto Schema y el objeto model
const mongoose = require('mongoose');
const {Schema} = mongoose;

// crear el esquema de la url
const urlsSchema = new Schema({
    origin: {
        type: String,
        unique: true,
        required: true
    },
    shortUrl: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

// crear el modelo
const Url = mongoose.model('Url', urlsSchema);

// exportar el modelo Url
module.exports = Url;