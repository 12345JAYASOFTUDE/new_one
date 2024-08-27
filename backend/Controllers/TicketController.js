import Ticket from "../Models/Ticket.js";

export const createTicket = async (req, res) => {
    console.log(req.body)
    const { title, description, priority,userId } = req.body;
    console.log(userId)
    if (!title || !description || !priority) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    try {
        const newTicket = new Ticket({
            title,
            description,
            priority,
            user: userId
        });
        await newTicket.save();
        res.status(201).json({ success: true, message: 'Ticket created', ticket: newTicket });
    } catch (err) {
        console.error('Error creating ticket:', err); // Log the error details
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

export const getTickets = async (req, res) => {
    const user = req.query.user;
    console.log(req.body)
    console.log("I am controllert calling...")
    try {
        const tickets = await Ticket.find({user}); // Populate user field if needed
        console.log( "ticketsticketstickets" ,tickets)
        res.status(200).json({ success: true, tickets });
    } catch (err) {
        console.error('Error fetching tickets:', err); // Log the error details
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
}

export const deleteticket = async (req, res) =>{
    const id = req.query.id;
    console.log(id);

  try {
    const result = await Ticket.findByIdAndDelete(id);
    console.log(result);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (err) {
    console.error('Error deleting ticket:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}


export const updateTicket = async (req, res) => {
    const ticketId = req.body._id; // Get ticket ID from URL parameters
    const updatedData = req.body;  // Get updated data from the request body
  
    try {
      const updatedTicket = await Ticket.findByIdAndUpdate(ticketId, updatedData, { new: true });
      
      if (!updatedTicket) {
        return res.status(404).json({ success: false, message: 'Ticket not found' });
      }
  
      res.json({ success: true, ticket: updatedTicket });
    } catch (error) {
      console.error('Error updating ticket:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };