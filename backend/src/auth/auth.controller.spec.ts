import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            loginJwt: jest.fn(),
            registerJwt: jest.fn(),
            getUserById: jest.fn(),
            signInGoogle: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              // Optional — mock config values
              if (key === 'SECURE_COOKIES') return true;
              if (key === 'FRONTEND_ORIGIN') return 'http://localhost:3000';
              return null;
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Optional: test one of the endpoints to verify wiring
  it('should call AuthService.loginJwt on loginJwt', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const mockRes = {
      cookie: jest.fn(),
      send: jest.fn(),
    } as any;

    (authService.loginJwt as jest.Mock).mockResolvedValue({
      access_token: 'mockToken',
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await controller.loginJwt({ username: 'test', password: 'pass' }, mockRes);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(authService.loginJwt).toHaveBeenCalledWith({
      username: 'test',
      password: 'pass',
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(mockRes.cookie).toHaveBeenCalledWith(
      'access_token',
      'mockToken',
      expect.any(Object),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(mockRes.send).toHaveBeenCalledWith({ message: 'Login successful' });
  });
});
