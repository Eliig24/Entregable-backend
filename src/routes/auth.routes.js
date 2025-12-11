import { Router } from 'express';
import { register, login, refresh } from '../controllers/auth.controller.js';
import { requireAuth, requireNoAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', requireNoAuth, register);
router.post('/login', requireNoAuth, login);
router.get('/refresh', refresh);
router.post('/logout', (req, res) => {
    res.clearCookie('accessToken');  // Eliminar la cookies del cliente
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logout exitoso' });
});
router.post("/requireAuth", requireAuth,)

export default router;