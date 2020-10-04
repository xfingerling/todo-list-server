import { ITodos } from '../interfaces/todos.interface';

export interface IReadableUser {
  readonly email: string;
  status: string;
  readonly login: string;
  readonly roles: Array<string>;
  readonly password: string;
  readonly todos: [ITodos];
  accessToken?: string;
}
