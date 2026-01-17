import { Registration, IRegistration, Camper } from "../models/registration.model";
import User from "../models/user.model";

export const findAllRegistrations = async () => {
  return Registration.find()
    .populate('camper')
    .populate('user', 'username firstname lastname amka email');
};

export const findRegistrationById = async (id: string) => {
  return Registration.findById(id)
    .populate('camper')
    .populate('user', 'username firstname lastname amka email');
};

export const findRegistrationsByUser = async (userId: string) => {
  return Registration.find({ user: userId })
    .populate('camper')
    .populate('user', 'username firstname lastname amka email');
};

export const findRegistrationsByCamper = async (camperId: string) => {
  return Registration.find({ camper: camperId })
    .populate('camper')
    .populate('user', 'username firstname lastname amka email');
};

export const createRegistration = async (payload: Partial<IRegistration>) => {

 if (!payload.camper || !payload.campPeriod || !payload.campType) {
    throw new Error('Camper, camp period, and camp type are required');
  }

  const camper = await Camper.findById(payload.camper);
  if (!camper) {
    throw new Error('Camper not found');
  }

  const user = await User.findById(payload.user);
  if (!user) {
    throw new Error('User not found');
  }

  if (camper.parent.toString() !== payload.user?.toString()) {
    throw new Error('Camper does not belong to this user');
  }

  const existingRegistration = await Registration.findOne({
    camper: payload.camper ,
    campPeriod: payload.campPeriod as IRegistration ['campPeriod']
  });

  if (existingRegistration) {
    throw new Error('Registration already exists for this camper and period');
  }

  if (payload.campType && payload.campPeriod) {
    const campType = payload.campType;
    const campPeriod = payload.campPeriod;

    if (campType === 'Ο Παράδεισος του Παιδιού' &&
      (campPeriod.includes('Δ') || campPeriod.includes('E'))) {
      throw new Error('This camp period is not available for selected camp type');
    }
  }

  const registration = new Registration(payload);
  return registration.save();
};

export const updateRegistration = async (id: string, payload: Partial<IRegistration>) => {
  if (payload.user || payload.camper) {
    throw new Error('Cannot change user or camper for existing registration');
  }

  return Registration.findByIdAndUpdate(id, payload, { new: true })
    .populate('camper')
    .populate('user', 'username firstname lastname amka email');
};

export const deleteRegistration = async (id: string) => {
  return Registration.findByIdAndDelete(id);
};

export const findRegistrationsByParentAmka = async (amka: string) => {
  const user = await User.findOne({ amka });
  if (!user) {
    return [];
  }

  return Registration.find({ user: user._id })
    .populate('camper')
    .populate('user', 'username firstname lastname amka email');
};

export const findRegistrationByCamperAmka = async (amka: string) => {
  const camper = await Camper.findOne({ amka });
  if (!camper) {
    return null;
  }

  return Registration.findOne({ camper: camper._id })
    .populate('camper')
    .populate('user', 'username firstname lastname amka email');
};

export { Registration };