import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { IsEmail, IsOptional, IsString } from "class-validator";

@Schema()
export class User 
{
    @Prop({unique: true, required: true})
    @IsString()
    username: string;
    
    @Prop()
    @IsString()
    @IsEmail()
    email: string;

    @Prop({required: false})
    @IsOptional()
    password?: string;

    @Prop({default: 'local'})
    provider: 'local' | 'google';
}

export const UserSchema = SchemaFactory.createForClass(User);