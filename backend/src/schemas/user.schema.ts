import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class User 
{
    @Prop({unique: true, required: true})
    username: string;
    
    @Prop()
    email: string;

    @Prop()
    password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);