import express from 'express';

import { assignticket } from '../Controllers/AssignTicketController.js';


const router = express.Router();


router.put('/assign', assignticket);



export default router;
