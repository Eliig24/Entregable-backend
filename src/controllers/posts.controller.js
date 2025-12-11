import Post from "../models/posts.models.js";
import { getDB } from '../db.js';
import { ObjectId } from 'mongodb';

export const getPosts = async (req, res) => {
    try {
        const db = getDB();
        const collection = db.collection('posts');

        const allItems = await collection.find().toArray();
    res.json({
        status: 'success',
        message: 'Lista de publicaciones obtenida correctamente',
        data: allItems
    });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener la lista de publicaciones'
        });
    }
};

export const createPost = async (req, res) => {
    try {
    const { title, content } = req.body;
    const db = getDB();
    const collection = db.collection('posts');

    const nuevaPublicacion = await collection.insertOne({
        title: title,
        content: content
    });
    res.status(201).json(nuevaPublicacion);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({
            status: 'error',
            message: 'Error al crear la publicación'
        });
    };
}

export const updatePost = async (req, res) => {
    try {
    const { id } = req.params;

    // Validar formato de id antes de convertir
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({
        status: 'error',
        message: 'ID inválido'
        });
    }

    // Sanear y filtrar el body: quitar id/_id y campos vacíos
    const updates = Object.fromEntries(
        Object.entries(req.body || {}).filter(([key, value]) => {
        if (key === 'id' || key === '_id') return false;
        if (value === '' || value === null || value === undefined) return false;
        return true;
        })
    );

    // Si no hay campos para actualizar, devolvemos 400
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({
        status: 'error',
        message: 'No hay campos válidos para actualizar'
        });
    }

    // (Opcional) actualizar updatedAt
    //updates.updatedAt = new Date();

    const db = getDB();
    const collection = db.collection('posts');

    // 1) Ejecutar updateOne
    const filter = { _id: new ObjectId(id) };
    const updateResult = await collection.updateOne(filter, { $set: updates });

    // Si no hubo coincidencias, devolver 404
    if (updateResult.matchedCount === 0) {
        return res.status(404).json({
        status: 'error',
        message: 'Publicación no encontrada'
        });
    }

    // 2) Leer el documento actualizado
    const updatedDoc = await collection.findOne(filter);

    // Por seguridad, comprobar nuevamente
    if (!updatedDoc) {
        return res.status(500).json({
        status: 'error',
        message: 'Error al recuperar la publicación actualizada'
        });
    }

    // Responder con el documento actualizado
    res.status(200).json({
        status: 'success',
        message: 'Publicación actualizada correctamente',
        data: updatedDoc
    });

    } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({
        status: 'error',
        message: 'Error al actualizar la publicación'
    });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();
        const collection = db.collection("posts");

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Publicación no encontrada'
            });
        }

        res.status(200).json({ message: "Publicación eliminada correctamente" });

    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({
            status: 'error',
            message: 'Error al eliminar la publicación'
        });
    }
}
