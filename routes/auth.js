import express from 'express';
import authController from '../controllers/auth.js'

const router = express.Router();

router.post('/register', authController.register);
router.post('/login',authController.login)

router.get('*', (req,res) => {
    return res.status(200).send('This route is not in use.')
  })

export default router;