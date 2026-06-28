const mongoose = require('mongoose');
const dns = require('dns');

// Para versiones de Node 24.14.0 o superior
dns.setServers(['8.8.8.8']);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/MundialDB';

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Conectado a MongoDB correctamente');
    } catch (error) {
        console.error("Error al conectar a MongoDB:", error);
    }
}

const equipoSchema = new mongoose.Schema({
    equipo:                { type: String, required: true },
    tecnico:               { type: String, required: true },
    continente:            { type: String, required: true },
    campeonatos_mundiales: { type: Number, required: true },
});

const Equipo = mongoose.model('Equipo', equipoSchema);

async function closeDB() {
    await mongoose.disconnect();
}

module.exports = { mongoose, connectDB, closeDB, Equipo };