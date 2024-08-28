import AssignTicket from "../Models/AssignTicket.js"; // Import the AssignTicket model
import Ticket from "../Models/Ticket.js"; // Import the Ticket model

export const assignticket = async (req, res) => {
  const { ticketId, resolverId } = req.body;
  console.log(req.body);

  try {
    // Fetch the ticket details
    console.log("Fetching ticket details...");
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      console.log("Ticket not found:", ticketId);
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    // Create a new AssignTicket document with the ticket details and resolverId
    const assignTicket = new AssignTicket({
      ticketId: ticket._id,
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: "Assigned", // Or any status you want to set when assigned
      resolverId: resolverId,
      userId: ticket.user, // Assuming the `user` field is populated from the Ticket model
    });

    // Save the AssignTicket document to the database
    await assignTicket.save();

    // Optionally, you can update the original ticket to reflect the assignment
    // If you want to keep the original ticket, comment out the following section
    ticket.resolverId = resolverId;
    ticket.status = "Assigned"; // Update ticket status if required
    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Ticket assigned successfully",
      ticket: assignTicket,
    });
  } catch (err) {
    console.error("Error assigning ticket:", err); // Log the error details
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
