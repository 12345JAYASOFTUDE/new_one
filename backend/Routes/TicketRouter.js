import express from 'express';
import ensureAuthenticated from '../middlewares/Auth.js';
import { createTicket } from '../Controllers/TicketController.js';
import { getTickets } from '../Controllers/TicketController.js';
import { deleteticket } from '../Controllers/TicketController.js';
import { updateTicket } from '../Controllers/TicketController.js';

const router = express.Router();


router.post('/create', ensureAuthenticated, createTicket);
router.get('/getticket', getTickets);
router.delete('/delete',deleteticket);
router.put('/update', updateTicket);



export default router;
