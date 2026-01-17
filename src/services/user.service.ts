import User, { IUser } from "../models/user.model";
import Role from "../models/role.model";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const findAllUsers = async () => {
  return User.find().populate('roles');
};

export const findUserById = async (id: string) => {
  return User.findById(id).populate('roles');
};

export const findUserByAmka = async (amka: string) => {
  return User.findOne({ amka }).populate('roles');
};

export const findUserByUsername = async (username: string) => {
  return User.findOne({ username }).populate('roles');
};

export const createUser = async (payload: Partial<IUser>) => {
  if (payload.password) {
    const hash = await bcrypt.hash(payload.password, SALT_ROUNDS);
    payload.password = hash;
  }

  if (payload.amka) {
    const existingUser = await User.findOne({ amka: payload.amka });
    if (existingUser) {
      throw new Error('User with this AMKA already exists');
    }
  }

  const userCount = await User.countDocuments();
  let roleIds = [];

  if (userCount === 0) {
    let adminRole = await Role.findOne({ role: "ADMIN" });
    if (!adminRole) {
      adminRole = await Role.create({ role: "ADMIN", description: "Administrator role", active: true });
    }
    roleIds = [adminRole._id];
  } else {
    let reader = await Role.findOne({ role: "READER" });
    if (!reader) {
      reader = await Role.create({ role: "READER", description: "Regular user role", active: true });
    }
    roleIds = [reader._id];
  }

  const user = new User({ ...payload, roles: roleIds });
  return user.save();
};

export const updateUser = async (id: string, payload: Partial<IUser>) => {
  if (payload.password) {
    const hash = await bcrypt.hash(payload.password, SALT_ROUNDS);
    payload.password = hash;
  }

  if (payload.amka) {
    const existingUser = await User.findOne({
      amka: payload.amka,
      _id: { $ne: id }
    });
    if (existingUser) {
      throw new Error('Another user already has this AMKA');
    }
  }

  return User.findByIdAndUpdate(id, payload, { new: true }).populate('roles');
};

export const deleteUser = async (id: string) => {
  return User.findByIdAndDelete(id);
};

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};