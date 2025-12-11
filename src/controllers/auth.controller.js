import { getDB } from '../db.js';
import { success } from 'zod';
import  sendEmail from '../service/email.service.js';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, extractRefreshToken } from '../service/jwt.service.js';
import { token } from 'morgan';
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
        return res.status(400).json({ 
            success: false,
            message: "Se requiere usuario, nombre y contraseña",
            error: "INVALID_FORM"
        });

    try {
    const db = getDB();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ 
            success: false,
            message: "El usuario ya existe",
            error: "USER_ALREADY_EXISTS"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        isVerified: false,
        twoFactorCode: null,
        twoFactorCodeExpiry: null,
        loginAttempts: 0,
        lockUntil: null,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);

    const userResponse = {
        _id: result.insertedId,
        name: newUser.name,
        email: newUser.email,
        isVerified: newUser.isVerified,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
    }

        try {
            await sendEmail({
                to: userResponse.email,
                subject: "Bienvenido a nuestro servicio",
                message: `Hello ${userResponse.name}, bienvenido a nuestro servicio!`,
                html: `<h1>Hello ${userResponse.name}</h1><p>bienvenido a nuestro servicio!</p>`
            })
        } catch (emailError) {
            console.error("Error sending welcome email:", emailError);
        }

        res.status(201).json({
            success: true,
            data: userResponse,
            message: "Usuario registrado correctamente"
        });
    } catch (error) {
    console.error("Error registering user:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
};

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const db = getDB();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Credenciales inválidas",
                error: "INVALID_CREDENTIALS"
            });
        }

        if (user.lockUntil && user.lockUntil > new Date()) {
            const remainingMinutes = Math.ceil((user.lockUntil - new Date()) / (1000 * 60));
            return res.status(423).json({
                success: false,
                message: `Cuenta bloqueada. Intente nuevamente en ${remainingMinutes} minutos.`,
                error: "ACCOUNT_LOCKED"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            const loginAttempts = (user.loginAttempts || 0) + 1;
            const updateData = { 
                loginAttempts,
                updatedAt: new Date(),
            };

            if (loginAttempts >= 3) {
                updateData.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
                updateData.loginAttempts = 0;
        }

        await usersCollection.updateOne({ _id: user._id }, { $set: updateData });

            return res.status(401).json({
                success: false,
                message: "Credenciales inválidas",
                error: "INVALID_CREDENTIALS"
            });
    }

    const tokenPayload = {
        userId: user._id,
        email: user.email,
        name: user.name
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        // Aquí enviamos el accessToken en una cookie HttpOnly
        res.cookie('accessToken', accessToken, {
            httpOnly: true,                  // La cookie no es accesible desde JS
            secure: process.env.NODE_ENV === 'production',  // Solo en HTTPS
            sameSite: 'Strict',              // Protege contra CSRF
            maxAge: 60 * 60 * 1000           // La cookie expira en 1 hora
        });

        // Aquí enviamos el refreshToken
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,                 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'Strict',             
            maxAge: 24 * 60 * 60 * 1000 // La cookie expira en 1 dia
        });

        res.status(200).json({
            success: true,
            message: "Login exitoso",
            data: {
                user: userResponse,
                tokens: {
                    accessToken,
                    refreshToken,
                    tokenType: "Bearer",
                    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
                }
            }
        });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({
            success: false,
            message: "Error del servidor",
            error: "SERVER_ERROR"
        });
    }
};

export const refresh = async (req, res) => {
    try {
        const refreshToken = extractRefreshToken(req);

        if (!refreshToken) {
            return res.status(401).json({ ok: false, error: "NO_REFRESH_TOKEN" });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        );

        const payload = {
            userId: decoded.userId
        };

        const newAccessToken = generateAccessToken(payload);
        const newRefreshToken = generateRefreshToken(payload);

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 60 * 60 * 1000, 
        });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            ok: true,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            userId: payload.userId
        });

    } catch (error) {
        console.error("Error refreshing token:", error);
        return res.status(401).json({
            ok: false,
            error: "INVALID_REFRESH_TOKEN"
        });
    }
};
