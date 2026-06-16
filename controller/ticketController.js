const Ticket = require("../models/Ticket");
const { ticketSchema, updateStatusSchema, assignSchema } = require("./validation/TicketValidation");

const createTicket = async (req, res, next) => {
  try {
    const { error, value } = ticketSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({
        msg: error.details.map((err) => err.message),
      });
    }

    const newTicket = await Ticket.create({ ...value, user: req.user });

    res.status(201).json({
      msg: "Ticket created successfully",
      ticket: newTicket,
    });
  } catch (error) {
    next(error);
  }
};

const getTickets = async (req, res, next) => {
  try {
    const query = req.userRole === "admin" ? {} : { user: req.user };

    // Search & Filter
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.company) {
      query.company = req.query.company;
    }

    const tickets = await Ticket.find(query)
      .populate("user", "name email")
      .populate("resolvedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ tickets });
  } catch (error) {
    next(error);
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const query = req.userRole === "admin"
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user };
    const ticket = await Ticket.findOne(query)
      .populate("user", "name email")
      .populate("assignedTo", "name email")
      .populate("resolvedBy", "name email");
    if (!ticket) return res.status(404).json({ msg: "Ticket not found" });

    res.status(200).json({ ticket });
  } catch (error) {
    next(error);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const { error, value } = ticketSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({
        msg: error.details.map((err) => err.message),
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, value, {
      new: true,
    });
    if (!ticket) return res.status(404).json({ msg: "Ticket not found" });

    res.status(200).json({ msg: "Ticket updated successfully", ticket });
  } catch (error) {
    next(error);
  }
};

const updateTicketStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;

    if (!status) {
      return res.status(400).json({ msg: "Status is required" });
    }

    const updateData = { status };
    if (adminNote !== undefined) {
      updateData.adminNote = adminNote;
    }

    if (status === "resolved") {
      if (req.userRole === "admin") {
        updateData.resolvedBy = req.user;
      }
      updateData.endDate = new Date();
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );
    if (!ticket) return res.status(404).json({ msg: "Ticket not found" });

    res.status(200).json({ msg: "Ticket status updated", ticket });
  } catch (error) {
    next(error);
  }
};

const assignTicket = async (req, res, next) => {
  try {
    const { error, value } = assignSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({
        msg: error.details.map((err) => err.message),
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignedTo: value.assignedTo },
      { new: true },
    );
    if (!ticket) return res.status(404).json({ msg: "Ticket not found" });

    res.status(200).json({ msg: "Ticket assigned successfully", ticket });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({});

    const total = tickets.length;
    const open = tickets.filter((t) => t.status === "open").length;
    const inProgress = tickets.filter((t) => t.status === "in-progress").length;
    const resolved = tickets.filter((t) => t.status === "resolved").length;

    const monthNames = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    const chartMap = {};
    monthNames.forEach((m) => {
      chartMap[m] = { month: m, Open: 0, InProgress: 0, Resolved: 0, Closed: 0 };
    });

    tickets.forEach((t) => {
      const month = monthNames[new Date(t.createdAt).getMonth()];
      if (!chartMap[month]) return;
      if (t.status === "open") chartMap[month].Open++;
      else if (t.status === "in-progress") chartMap[month].InProgress++;
      else if (t.status === "resolved") chartMap[month].Resolved++;
      else if (t.status === "closed") chartMap[month].Closed++;
    });

    const chartData = Object.values(chartMap);

    const topEmployees = await Ticket.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $project: { _id: 0, name: "$user.name", email: "$user.email", count: 1 } },
    ]);

    res.status(200).json({ total, open, inProgress, resolved, chartData, topEmployees });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  updateTicketStatus,
  assignTicket,
  getDashboardStats,
};
