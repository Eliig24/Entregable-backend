import postsModels from "../models/posts.models.js";

//TODO: revisar si esta bien hecho

export const getPosts = async (req, res) => {
    try {
        const publicaciones = await postsModels.find();
    res.json({
        status: 'success',
        message: 'Lista de publicaciones obtenida correctamente',
        data: publicaciones
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
    const { body } = req.body;
    const nuevaPublicacion = await postsModels.create({
        id: publicaciones.length + 1,
        title: body.title,
        content: body.content
    })
    res.status(201).json(nuevaPublicacion);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({
            status: 'error',
            message: 'Error al crear la publicación'
        });
    };

    publicaciones.push(nuevaPublicacion);
    res.status(201).json(nuevaPublicacion);
}

export const updatePost = async (req, res) => {
    try {
    const { id } = req.params;
    
    const { body } = req.body;
    const publicacionIndex = publicaciones.findIndex(publicacion => publicacion.id === parseInt(id));
    publicaciones[publicacionIndex] = {
        ...publicaciones[publicacionIndex],
        title: body.title,
        content: body.content
    };
    
    if (publicacionIndex === -1) {
        return res.status(404).json({
            status: 'error',
            message: 'Publicación no encontrada'
        });
    }

    res.status(200).json({ message: "Publicación actualizada correctamente" });
} catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({
        status: 'error',
        message: 'Error al actualizar la publicación'
    });
    }
};

export const deletePost = async (req, res) => {
    try {
    const { id } = req.params;
    const publicacionEliminada = publicaciones.find(publicacion => publicacion.id === parseInt(id));

    if (!publicacionEliminada) {
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