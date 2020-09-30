import * as mongoose from 'mongoose';
import { roleEnum } from '../enums/role.enum';

const todosSchema = new mongoose.Schema({
  task: { type: String, unique: true, required: true },
  created: { type: String, required: true },
});

export const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  login: { type: String, required: true },
  avatar: { type: String, default: null },
  avatarId: { type: String, default: null },
  role: { type: [String], required: true, enum: Object.values(roleEnum) },
  password: { type: String, required: true },
  todos: { type: [todosSchema], required: true },
});

UserSchema.index({ email: 1 }, { unique: true });
