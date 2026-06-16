const express = require("express");
const router = express.Router();
const { addComment, getComments } = require("../controller/commentController");
const { authMiddleware } = require("../Middleware/authMiddleware");

router.post("/tickets/:ticketId/comments", authMiddleware, addComment);
router.get("/tickets/:ticketId/comments", authMiddleware, getComments);

module.exports = router;
