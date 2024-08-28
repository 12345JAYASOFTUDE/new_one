import mongoose from 'mongoose';

// Define the schema for Ticket
const AssignTicketschema = new mongoose.Schema({
  title: String,
  priority: String,
  status: String,
  ticketId:{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'Ticket', // Reference to Ticket model for ticketId
    required: true

  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  resolverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model for resolver
       required: true
  },
  // other fields...
});

// Export the Ticket model
export default mongoose.model('AssignTicket', AssignTicketschema);
