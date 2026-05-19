import Joi from 'joi';

const codedId = Joi.string().pattern(/^[A-Z]{3,4}-[A-Z2-9]{6}$/);

export const createEquipmentSchema = Joi.object({
  model: Joi.string().required(),
  type: Joi.string().required(),
  serial_number: Joi.string().required(),
  equipment_status: Joi.string().valid('available', 'in_use', 'maintenance', 'lost').default('available'),
  container_id: codedId.optional(),
});

export const updateEquipmentSchema = Joi.object({
  model: Joi.string().optional(),
  type: Joi.string().optional(),
  serial_number: Joi.string().optional(),
  equipment_status: Joi.string().valid('available', 'in_use', 'maintenance', 'lost').optional(),
  container_id: codedId.optional(),
});
