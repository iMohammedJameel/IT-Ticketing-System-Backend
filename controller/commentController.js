const Comment = require("../models/Comment");
const Ticket = require("../models/Ticket");

const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const { ticketId } = req.params;

    if (!text || !text.trim()) {
      return res.status(400).json({ msg: "Comment text is required" });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ msg: "Ticket not found" });
    }

    if (req.userRole !== "admin" && ticket.user.toString() !== req.user) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    const comment = await Comment.create({
      ticket: ticketId,
      user: req.user,
      text: text.trim(),
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      "user",
      "name email profileImage role"
    );

    res.status(201).json({ comment: populatedComment });
  } catch (error) {
    next(error);
  }
};

const getComments = async (req, res, next) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ msg: "Ticket not found" });
    }

    if (req.userRole !== "admin" && ticket.user.toString() !== req.user) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    const comments = await Comment.find({ ticket: ticketId })
      .populate("user", "name email profileImage role")
      .sort({ createdAt: 1 });

    res.status(200).json({ comments });
  } catch (error) {
    next(error);
  }
};

module.exports = { addComment, getComments };
