const express = require('express');
const { mongoose, connectDB, closeDB, Equipo } = require('./src/mongoose');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// GET /equipos — Trae todos los equipos
app.get('/equipos', async (req, res) => {
    try {
        const equipos = await Equipo.find();
        res.status(200).json(equipos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /equipos/buscar?tecnico=... — Busca por nombre de técnico (case-insensitive)
// IMPORTANTE: esta ruta va ANTES que /equipos/:id
app.get('/equipos/buscar', async (req, res) => {
    try {
        const { tecnico } = req.query;
        const equipos = await Equipo.find({ tecnico: { $regex: tecnico, $options: 'i' } });
        res.status(200).json(equipos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /equipos/:id — Trae un equipo por su ID
app.get('/equipos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }
        const equipo = await Equipo.findById(id);
        if (!equipo) {
            return res.status(404).json({ error: "Equipo no encontrado" });
        }
        res.status(200).json(equipo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /equipos — Crea un nuevo equipo
app.post('/equipos', async (req, res) => {
    try {
        const { equipo, tecnico, continente, campeonatos_mundiales } = req.body;
        const nuevoEquipo = new Equipo({ equipo, tecnico, continente, campeonatos_mundiales });
        await nuevoEquipo.save();
        res.status(201).json(nuevoEquipo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /equipos/:id — Actualiza un equipo existente
app.put('/equipos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        // Validación manual de campos requeridos
        const { equipo, tecnico, continente, campeonatos_mundiales } = req.body;
        if (!equipo || !tecnico || !continente || campeonatos_mundiales === undefined) {
            return res.status(400).json({ error: "Faltan campos requeridos" });
        }

        const equipoActualizado = await Equipo.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true, context: 'query' }
        );
        if (!equipoActualizado) {
            return res.status(404).json({ error: "Equipo no encontrado" });
        }
        res.status(200).json(equipoActualizado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /equipos/:id — Elimina un equipo por su ID
app.delete('/equipos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }
        const equipoEliminado = await Equipo.findByIdAndDelete(id);
        if (!equipoEliminado) {
            return res.status(404).json({ error: "Equipo no encontrado" });
        }
        res.status(200).json({ message: "Equipo eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Iniciar el servidor solo si este archivo se ejecuta directamente
if (require.main === module) {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor escuchando en http://localhost:${PORT}`);
        });
    });
}

module.exports = { app, closeDB, connectDB };