import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserEntity } from '../../../generic.dtos/userDtoAndEntity';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('findOne', () => {
    it('should return user entity when username exists - regular user', async () => {
      const expectedUser: UserEntity = {
        userId: 1,
        username: 'user',
        password: '12345',
        roles: ['user'],
      };

      const result = await service.findOne('user');
      expect(result).toEqual(expectedUser);
    });

    it('should return user entity when username exists - admin user', async () => {
      const expectedUser: UserEntity = {
        userId: 2,
        username: 'admin',
        password: '12345',
        roles: ['user', 'admin'],
      };

      const result = await service.findOne('admin');
      expect(result).toEqual(expectedUser);
    });

    it('should return undefined when username does not exist', async () => {
      const result = await service.findOne('nonexistent');
      expect(result).toBeUndefined();
    });

    it('should handle case-sensitive usernames correctly', async () => {
      const result = await service.findOne('ADMIN');
      expect(result).toBeUndefined();
    });

    it('should handle empty username', async () => {
      const result = await service.findOne('');
      expect(result).toBeUndefined();
    });
  });
});
