import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class User 
{
    @Prop({unique: true, required: true})
    username: string;
    
    @Prop()
    email: string;

    @Prop()
    hashedPassword: string;
}

export const UserSchema = SchemaFactory.createForClass(User);