import { Types } from "mongoose";

export interface AuthPayload {
  userId: Types.ObjectId;
  username: string;
  email?: string;
  roles: Types.ObjectId[];
}