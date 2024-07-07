import express from 'express';
import apiController from '../controllers/api.js'
import auth from '../middleware/auth.js'

const router = express.Router();

router.get('/users/:id',auth,apiController.getUserRecord);

router.post('/organisations/:orgId/users',apiController.addUserToAnOrganisation)

router.get('/organisations/:orgId',auth,apiController.getOrganisationRecord);

router.get('/organisations',auth,apiController.getAllOrganisations);

router.post('/organisations',auth,apiController.createNewOrganisation);



export default router;
