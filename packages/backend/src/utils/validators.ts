import Joi from "joi";

import { CustomerInput } from "../models/customer";
import { DriverInput } from "../models/driver";
import { PositionInput } from "../models/position";
import { TripInput } from "../models/trip";
import { VehicleInput } from "../models/vehicle";

export const validateVehicle = (data: VehicleInput) => {
  const schema = Joi.object({
    license_plate: Joi.string().required().max(20),
    customer_id: Joi.number().required().integer().min(1),
  });

  return schema.validate(data);
};

export const validateDriver = (data: DriverInput) => {
  const schema = Joi.object({
    first_name: Joi.string().required().max(100),
    last_name: Joi.string().required().max(100),
    customer_id: Joi.number().required().integer().min(1),
    vehicle_id: Joi.number().integer().min(1).allow(null),
  });

  return schema.validate(data);
};

export const validateCustomer = (data: CustomerInput) => {
  const schema = Joi.object({
    name: Joi.string().required().max(255),
    email: Joi.string().email().max(255).allow(null, ""),
  });

  return schema.validate(data);
};

export const validatePosition = (data: PositionInput) => {
  const schema = Joi.object({
    vehicle_id: Joi.number().required().integer().min(1),
    latitude: Joi.number().required().min(-90).max(90),
    longitude: Joi.number().required().min(-180).max(180),
    speed: Joi.number().min(0).max(300),
    ignition: Joi.boolean(),
  });

  return schema.validate(data);
};

export const validateTrip = (data: TripInput) => {
  const schema = Joi.object({
    vehicle_id: Joi.number().required().integer().min(1),
    driver_id: Joi.number().required().integer().min(1),
    start_time: Joi.date().required(),
    end_time: Joi.date().min(Joi.ref("start_time")).allow(null),
    distance: Joi.number().min(0),
  });

  return schema.validate(data);
};
