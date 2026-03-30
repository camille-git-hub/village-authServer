import { Schema, model } from 'mongoose';
import { REFRESH_TOKEN_TTL } from '#config';

export type RefreshToken = {
  _id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
};  

const refreshTokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: REFRESH_TOKEN_TTL / 1000 }
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

const RefreshToken = model('RefreshToken', refreshTokenSchema);

export default RefreshToken;
