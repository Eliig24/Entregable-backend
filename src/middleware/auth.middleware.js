import jwt from "jsonwebtoken";
import { extractToken } from "../service/jwt.service.js";

export const requireAuth = async (req, res, next) => {
    try {
        const token = extractToken(req);

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

export const requireNoAuth = async (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token) {
            next();
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        return res.status(427).json({
            success: false,
            message: 'Token Valido',
            error: 'INVALID_TOKEN',
        });

    } catch (error) {
        next();
    }
}

