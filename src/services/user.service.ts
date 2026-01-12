import User, { IUser } from "../models/user.model"
import Role, { IRole } from "../models/role.model";



export const findAllUsers = async() => {
  return User.find().populate('roles').lean()
}

export const findUserById = async(id: string) => {
  return User.findById(id).populate('roles').lean();
}
