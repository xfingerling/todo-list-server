import { Document } from 'mongoose';
import { ITodos } from './todos.interface';

export interface IUser extends Document {
  readonly email: string;
  status: string;
  readonly login: string;
  readonly roles: Array<string>;
  readonly password: string;
  readonly todos: [ITodos];
}
