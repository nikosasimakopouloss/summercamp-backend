import { Schema, model, Document, Types } from "mongoose";

export interface IPhone {
  type: string;
  number: string;
}

export interface IAddress {
  area?: string;
  street?: string;
  number?: string;
  po?: string;
  municipality?: string;
}

export interface IUser extends Document {
  username: string;
  password: string;
  firstname?: string;
  lastname?: string;
  amka: string;
  email?: string;
  address?: IAddress;
  phone?: IPhone[];
  roles: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PhoneSchema = new Schema<IPhone>({
  type: String,
  number: String
}, { _id: false });

const AddressSchema = new Schema<IAddress>({
  area: String,
  street: String,
  number: String,
  po: String,
  municipality: String
}, { _id: false });

const UserSchema = new Schema<IUser>({
  username: { 
    type: String, 
    required: [true, "Username is required field"], 
    unique: true,
    max: 20,
    min: 4,
    trim: true,
    lowercase: true 
  },
  password: { type: String, required: true },
  firstname: String,
  lastname: String,
  amka: { 
    type: String,
    required: [true, "AMKA is required"],
    unique: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^\d{11}$/.test(v);
      },
      message: "AMKA must be exactly 11 digits"
    }
  },
  email: { 
    type: String, 
    lowercase: true,
    trim: true
  },
  address: AddressSchema,
  phone: { type: [PhoneSchema], default: null },
  roles: [{ type: Schema.Types.ObjectId, ref: "Role", required: true }]
}, {
  collection: "users",
  timestamps: true,
});

export default model<IUser>("User", UserSchema);