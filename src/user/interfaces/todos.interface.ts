import { Document } from 'mongoose';

export interface ITodos extends Document {
  readonly task: string;
  readonly created: string;
}
