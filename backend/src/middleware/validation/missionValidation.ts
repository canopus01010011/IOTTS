import Joi from 'joi';

const codedId = Joi.string().pattern(/^[A-Z]{3,4}-[A-Z2-9]{6}$/);

export const createMissionSchema = Joi.object({
  scheduled_start_date: Joi.date().required(),
  scheduled_end_date: Joi.date().required(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  technician_id: codedId.required(),
  driver_id: codedId.required(),
  equipment_list: Joi.array().items(
    Joi.object({
      equipment_id: codedId.required(),
      quantity: Joi.number().min(1).required()
    })
  ).required(),
  container_id: codedId.optional(),
  site_id: codedId.required(),
});

export const updateMissionSchema = Joi.object({
  scheduled_start_date: Joi.date().optional(),
  scheduled_end_date: Joi.date().optional(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  technician_id: codedId.optional(),
  driver_id: codedId.optional(),
  equipment_list: Joi.array().items(
    Joi.object({
      equipment_id: codedId.required(),
      quantity: Joi.number().min(1).required()
    })
  ).optional(),
  container_id: codedId.optional(),
  site_id: codedId.optional(),
});

export const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('in-progress', 'completed')
    .required(),
});
