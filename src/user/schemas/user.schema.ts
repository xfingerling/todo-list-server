import * as mongoose from 'mongoose';
import { roleEnum } from '../enums/role.enum';
import { statusEnum } from '../enums/status.enum';

const TodosSchema = new mongoose.Schema({
  task: { type: String },
  created: { type: String },
});

export const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  status: {
    type: String,
    enum: Object.values(statusEnum),
    default: statusEnum.pending,
  },
  login: { type: String, required: true },
  roles: { type: [String], required: true, enum: Object.values(roleEnum) },
  password: { type: String, required: true },
  todos: { type: [TodosSchema], default: [] },
});

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ login: 1 }, { unique: true });
