import mongoose from 'mongoose';

export const USER_ROLES = ['buyer', 'seller', 'repairman'];

const ProfileSchema = new mongoose.Schema(
  {
    bio: { type: String, default: '' },
    experienceYears: { type: Number, default: 0 },
    wilaya: { type: String, default: '' },
    phone: { type: String, default: '' },
    ratingsAvg: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, required: true },
    profile: ProfileSchema,
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema); 