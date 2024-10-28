import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an access token if credentials are valid', async () => {
    jest.spyOn(usersService, 'findOne').mockResolvedValue({
      userId: 1,
      username: 'user',
      password: 'pass',
    });
    expect(await service.signIn('user', 'pass')).toEqual({ access_token: 'token' });
  });

  it('should throw UnauthorizedException if credentials are invalid', async () => {
    jest.spyOn(usersService, 'findOne').mockResolvedValue({
      userId: 1,
      username: 'user',
      password: 'wrongpass',
    });
    await expect(service.signIn('user', 'pass')).rejects.toThrow(UnauthorizedException);
  });
});
