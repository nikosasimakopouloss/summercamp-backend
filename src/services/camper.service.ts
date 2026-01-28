import { Camper, ICamper } from "../models/registration.model";

export const findAllCampers = async () => {
  return Camper.find().populate('parent', 'username firstname lastname amka email');
};

export const findCamperById = async (id: string) => {
  return Camper.findById(id).populate('parent', 'username firstname lastname amka email');
};

export const findCamperByAmka = async (amka: string) => {
  return Camper.findOne({ amka }).populate('parent', 'username firstname lastname amka email');
};

export const findCampersByUser = async (userId: string) => {
  return Camper.find({ parent: userId }).populate('parent', 'username firstname lastname amka email');
};

export const createCamper = async (payload: Partial<ICamper>) => {
  if (payload.amka) {
    const existingCamper = await Camper.findOne({ amka: payload.amka });
    if (existingCamper) {
      throw new Error('Camper with this AMKA already exists');
    }
  }

  const camper = new Camper(payload);
  return camper.save();
};

export const updateCamper = async (id: string, payload: Partial<ICamper>) => {
  if (payload.amka) {
    const existingCamper = await Camper.findOne({
      amka: payload.amka,
      _id: { $ne: id }
    });
    if (existingCamper) {
      throw new Error('Another camper already has this AMKA');
    }
  }

  return Camper.findByIdAndUpdate(id, payload, { new: true })
    .populate('parent', 'username firstname lastname amka email');
};

export const deleteCamper = async (id: string) => {
  // const { Registration } = await import("./registration.service.js");
  const { Registration } = require("./registration.service")
  
  
  const registrations = await Registration.find({ camper: id });

  if (registrations.length > 0) {
    throw new Error('Cannot delete camper with existing registrations');
  }

  return Camper.findByIdAndDelete(id);
};