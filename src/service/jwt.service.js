import jwt from 'jsonwebtoken';

/**
 * Genera un token de acceso JWT
 * @param {Object} payload Datos a incluir en el token
 * @param {String} payload.userId ID del usuario
 * @param {String} payload.email Email del usuario
 * @param {String} payload.name Nombre del usuario
 * @returns {String} JWT token
 */

export const generateAccessToken = (payload) => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { 
            expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
            issuer: 'entregable-backend',
            audience: 'entregable-backend-users' 
        }
    );
}

export const generateRefreshToken = (payload) => {
    return jwt.sign(
        {userId: payload.userId},
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { 
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '1d',
            issuer: 'entregable-backend',
            audience: 'entregable-backend-users' 
        }
    );
}



export const extractToken = (req) => {
// Cookies (común: token, authToken, auth_token, accessToken)
if (req.cookies) {
    const cookieToken =
    req.cookies.token || req.cookies.authToken || req.cookies.auth_token || req.cookies.accessToken;
    if (cookieToken) return cookieToken;
}

// Signed cookies (para cookie-parser con 'signed: true')
if (req.signedCookies) {
    const signed = req.signedCookies.token || req.signedCookies.authToken || req.signedCookies.auth_token || req.cookies.accessToken;
    if (signed) return signed;
}

// Authorization header (Bearer <token>)
const authHeader = req.headers?.authorization || req.get?.('Authorization');
if (!authHeader) return null;
if (authHeader.startsWith('Bearer ')) return authHeader.slice(7).trim();

// 3.b) Si te pasaron directamente el token como string
  if (typeof req === "string") {
    if (req.startsWith("Bearer ")) return req.slice(7).trim();
    return null;
  }

return null;
}

export const extractRefreshToken = (req) => {
if (req.cookies) {
    const cookieToken = req.cookies.refToken || req.cookies.ref_token || req.cookies.refreshToken;
    if (cookieToken) return cookieToken;
}

if (req.signedCookies) {
    const signed = req.signedCookies.refToken || req.signedCookies.ref_token || req.cookies.refreshToken;
    if (signed) return signed;
}

if (req.body.refreshToken) {
   return req.body.refreshToken
}
return null;
}