const Joi = require("joi");

const ticketSchema = Joi.object({
  product: Joi.string().required().min(2).max(100),
  employee: Joi.string().required().min(2).max(100),
  company: Joi.string().required().min(2).max(100),
  startDate: Joi.date().required(),
  endDate: Joi.date().required().greater(Joi.ref("startDate")),
  description: Joi.string().required().min(5),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid("open", "in-progress", "resolved", "closed").required(),
});

const assignSchema = Joi.object({
  assignedTo: Joi.string().required(),
});

module.exports = {
  ticketSchema,
  updateStatusSchema,
  assignSchema,
};
