import { Document } from 'mongoose';
import { ITodos } from './todos.interface';

export interface IUser extends Document {
  readonly email: string;
  readonly login: string;
  readonly avatar: string;
  readonly avatarId: string;
  readonly role: Array<string>;
  readonly password: string;
  readonly todos: [ITodos];
}
