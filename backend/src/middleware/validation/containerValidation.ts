import Joi from 'joi';

const containerStatus = Joi.string().valid(
  'available',
  'assigned',
  'in_transit',
  'delivered',
  'maintenance',
);

export const createContainerSchema = Joi.object({
  qr_code: Joi.string().min(1).required(),
  capacity: Joi.number().positive().required(),
  status: containerStatus.optional(),
});

export const updateContainerSchema = Joi.object({
  qr_code: Joi.string().min(1).optional(),
  capacity: Joi.number().positive().optional(),
  status: containerStatus.optional(),
});
