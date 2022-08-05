const mongoose = require('mongoose');
require('dotenv').config();
const colors = require('colors');

const clientDB = mongoose
    .connect(process.env.URI)
    .then((m) => {
        console.log('Conectado a MongoDB'.green);
        return m.connection.getClient();
    })
    .catch((e) => console.log(`fallo la conexion a MongoDB ${e}`.red));


module.exports = clientDB;