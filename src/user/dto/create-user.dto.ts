import { ITodos } from '../interfaces/todos.interface';

export class CreateUserDto {
  readonly email: string;
  readonly login: string;
  readonly avatar: string;
  readonly avatarId: string;
  readonly role: Array<string>;
  readonly password: string;
  readonly todos: [ITodos];
}
