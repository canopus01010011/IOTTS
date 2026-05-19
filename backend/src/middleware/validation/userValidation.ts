import Joi from 'joi';

export const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  first_name: Joi.string().optional(),
  second_name: Joi.string().optional(),
  full_name: Joi.string().required(),
  role: Joi.string().valid('admin', 'technician', 'driver').required(),
  phone: Joi.string().required(),
});

export const updateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  first_name: Joi.string().optional(),
  second_name: Joi.string().optional(),
  full_name: Joi.string().optional(),
  role: Joi.string().valid('admin', 'technician', 'driver').optional(),
  phone: Joi.string().optional(),
});
