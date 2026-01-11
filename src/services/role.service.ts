import Role, { IRole } from '../models/role.model'



export const findAllRoles = async()=>{
  return Role.find().lean();
}


export const createRole = async(payload: Partial <IRole>)=>{

const result = new Role (payload);


  return result.save();
}