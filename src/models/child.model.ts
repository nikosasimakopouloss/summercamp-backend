import { Schema, model, Document, Types } from "mongoose";

export interface IPhone {type: string; number: string}

export interface IAddress {
  area?:string;
  street?: string;
  number?: string;
  po?: string;
  municipality?: string;
}

export interface IChild extends Document {
  
  firstname?: string;
  lastname?: string;
  email?: string;
  address?: {
    area?: string;
    street?: string;
    number?: string;
    po?: string;
    municipality?: string;
  },
  phone?: IPhone[],
  roles: Types.ObjectId[]
}

const PhoneSchema = new Schema<IPhone>({
    type: String, 
    number: String
  },
  // {_id:false} inserts _id or not
)

const AddressSchema = new Schema<IAddress>({
  area: String,
  street: String,
  number: String,
  po: String,
  municipality: String
})

const ChildSchema = new Schema<IChild>({
  
  
  firstname: { type: String} ,
  lastname: { type: String },
  email: {type: String, index: true},
  // address : {
  //   area: String,
  //   street: String,
  //   number: String,
  //   po: String,
  //   municipality: String
  // },
  address: AddressSchema,
  phone: { type: [PhoneSchema], null: true },
  roles: [{type: Schema.Types.ObjectId, ref:"Role", required: true}]
},{
  collection: "children",
  timestamps: true,
});

export default model("Child", ChildSchema);