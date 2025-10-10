import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { MaterialModule } from './material/material.module';
import { SampleSchema } from './schemas/sample.schema';
import { PresetSchema } from './schemas/preset.schema';
import { PackSchema } from './schemas/pack.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI as string),
    UsersModule,
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '120s' },
      }),
      global: true,
    }),
    MaterialModule.register({ modelName: 'Sample', schema: SampleSchema }),
    MaterialModule.register({ modelName: 'Preset', schema: PresetSchema }),
    MaterialModule.register({ modelName: 'Pack', schema: PackSchema }),

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
