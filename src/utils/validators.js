import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().required().min(2),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  city: Joi.string().optional(),
  examPreparingFor: Joi.string().optional(),
  monthlyBudget: Joi.number().optional(),
  wakeTime: Joi.string().optional(),
  sleepTime: Joi.string().optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
