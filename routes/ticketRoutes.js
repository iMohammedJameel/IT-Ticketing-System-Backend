const express = require("express");
const router = express.Router();

const { createTicket, getTickets, getTicketById, updateTicket, updateTicketStatus, assignTicket, getDashboardStats } = require("../controller/ticketController");
const { authMiddleware, allowedTo } = require("../Middleware/authMiddleware");

router.get("/tickets/stats", authMiddleware, allowedTo("admin"), getDashboardStats);
router.post("/tickets", authMiddleware, createTicket);
router.get("/tickets", authMiddleware, getTickets);
router.get("/tickets/:id", authMiddleware, getTicketById);
router.put("/tickets/:id", authMiddleware, allowedTo("admin"), updateTicket);
router.put("/tickets/:id/status", authMiddleware, allowedTo("admin"), updateTicketStatus);
router.put("/tickets/:id/assign", authMiddleware, allowedTo("admin"), assignTicket);

module.exports = router;