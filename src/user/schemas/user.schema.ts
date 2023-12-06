import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
    versionKey: false,
    toJSON: {
        transform(doc, ret) {
            delete ret.passwordHash;
        },
    },
})
export class User {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, index: true, unique: true })
    email: string;

    @Prop({ required: true })
    passwordHash: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
