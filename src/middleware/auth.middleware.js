import jwt from "jsonwebtoken";
import { extractTokenFromHeader } from "../service/jwt.service.js";

//TODO: como se si el usuario esta autenticado?

export const requireAuth = async (req, res, next) => {
    try {
        console.log("requireAuth");
        console.log("req.headers", req.headers);
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado',
                error: 'NO_AUTH_HEADER'
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        next();

    } catch (error) {
        console.error('Authentication error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido',
                error: 'INVALID_TOKEN',
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado',
                error: 'TOKEN_EXPIRED',
            });
        }
        return res.status(500).json({
            success: false,
            message: 'No autorizado',
            error: 'SERVER_ERROR'
        });
    }
}
