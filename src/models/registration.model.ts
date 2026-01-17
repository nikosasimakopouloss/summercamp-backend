import { Schema, model, Document, Types } from 'mongoose';

export interface ICamper extends Document {
  fullName: string;
  dateOfBirth: Date;
  amka: string;
  visitorType: 'Παλιός κατασκηνωτής' | 'Νέος κατασκηνωτής';
  additionalInfo?: string;
  healthDeclarationAccepted: boolean;
  parent: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRegistration extends Document {
  campType: 'Η Φωλιά του Παιδιού' | 'Ο Παράδεισος του Παιδιού';
  campPeriod: 
    'A\' (16/6 - 30/6)' |
    'B\' (17/7 - 15/7)' |
    'Γ\' (16/7 - 30/7)' |
    'Δ\' (31/7 - 14/8) Μόνο για την Φωλιά' |
    'E\' (17/8 - 31/8) Μόνο για την Φωλιά';
  camper: Types.ObjectId;
  user: Types.ObjectId;
  beneficiary: 'Μητέρα' | 'Πατέρας';
  motherName: string;
  fatherName: string;
  socialSecurityFund?: string;
  registrationDate: Date;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CamperSchema = new Schema<ICamper>({
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  amka: { type: String, required: true, unique: true },
  visitorType: { type: String, required: true },
  additionalInfo: String,
  healthDeclarationAccepted: { type: Boolean, required: true, default: false },
  parent: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  collection: 'campers',
  timestamps: true
});

const RegistrationSchema = new Schema<IRegistration>({
  campType: { type: String, required: true },
  campPeriod: { type: String, required: true },
  camper: { type: Schema.Types.ObjectId, ref: 'Camper', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  beneficiary: { type: String, required: true },
  motherName: { type: String, required: true },
  fatherName: { type: String, required: true },
  socialSecurityFund: String,
  registrationDate: { type: Date, default: Date.now, required: true },
  isActive: { type: Boolean, default: true, required: true },
  notes: String
}, {
  collection: 'registrations',
  timestamps: true
});

export const Camper = model<ICamper>('Camper', CamperSchema);
export const Registration = model<IRegistration>('Registration', RegistrationSchema);