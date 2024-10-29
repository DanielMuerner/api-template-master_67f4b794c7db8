import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from '../todo.service/todo.service';
import { UserService } from '../../sample/modules/auth/user.service/user.service';
import { CreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserInfoDto } from '../../sample/generic.dtos/userDtoAndEntity';

describe('TodoController', () => {
  let controller: TodoController;
  let userService: UserService;

  const mockTodoService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: mockTodoService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<TodoController>(TodoController);
    userService = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of todos', async () => {
      const expectedTodos = [{ id: 1, title: 'Test', description: 'Test desc', closed: false }];
      mockTodoService.findAll.mockResolvedValue(expectedTodos);

      const result = await controller.findAll();

      expect(result).toEqual(expectedTodos);
      expect(mockTodoService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single todo', async () => {
      const expectedTodo = { id: 1, title: 'Test', description: 'Test desc', closed: false };
      mockTodoService.findOne.mockResolvedValue(expectedTodo);

      const result = await controller.findOne(1);

      expect(result).toEqual(expectedTodo);
      expect(mockTodoService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new todo', async () => {
      const createTodoDto: CreateTodoDto = {
        title: 'New Todo',
        description: 'New Description',
      };
      const expectedTodo = {
        id: 1,
        ...createTodoDto,
        closed: false,
      };
      mockTodoService.create.mockResolvedValue(expectedTodo);

      const result = await controller.create(createTodoDto);

      expect(result).toEqual(expectedTodo);
      expect(mockTodoService.create).toHaveBeenCalledWith(createTodoDto);
    });
  });

  describe('update', () => {
    it('should update a todo', async () => {
      const updateTodoDto: UpdateTodoDto = {
        title: 'Updated Title',
      };
      const expectedTodo = {
        id: 1,
        title: 'Updated Title',
        description: 'Original Description',
        closed: false,
      };
      mockTodoService.update.mockResolvedValue(expectedTodo);

      const result = await controller.update(1, updateTodoDto);

      expect(result).toEqual(expectedTodo);
      expect(mockTodoService.update).toHaveBeenCalledWith(1, updateTodoDto);
    });
  });

  describe('remove', () => {
    const mockUser: UserInfoDto = {
      username: 'testuser',
      userId: 1,
    };

    it('should remove a todo when user is admin', async () => {
      const todoId = '1';
      const mockTodo = {
        id: 1,
        title: 'Test Todo',
        description: 'Test Description',
        closed: false,
      };

      mockUserService.findOne.mockResolvedValue({ roles: ['admin'] });
      mockTodoService.findOne.mockResolvedValue(mockTodo);
      mockTodoService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(todoId, mockUser);

      expect(result).toEqual({
        id: mockTodo.id,
        title: mockTodo.title,
        description: mockTodo.description,
      });
      expect(mockUserService.findOne).toHaveBeenCalledWith(mockUser.username);
      expect(mockTodoService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      mockUserService.findOne.mockResolvedValue({ roles: ['user'] });

      await expect(controller.remove('1', mockUser)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when todo not found', async () => {
      mockUserService.findOne.mockResolvedValue({ roles: ['admin'] });
      mockTodoService.findOne.mockResolvedValue(null);

      await expect(controller.remove('1', mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('patch', () => {
    it('should patch a todo successfully', async () => {
      const updateDto: UpdateTodoDto = {
        title: 'Patched Title',
      };
      const expectedTodo = {
        id: 1,
        title: 'Patched Title',
        description: 'Original Description',
        closed: false,
      };
      mockTodoService.update.mockResolvedValue(expectedTodo);

      const result = await controller.patch('1', updateDto);

      expect(result).toEqual(expectedTodo);
      expect(mockTodoService.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should throw NotFoundException when todo not found for patch', async () => {
      const updateDto: UpdateTodoDto = {
        title: 'Patched Title',
      };
      mockTodoService.update.mockResolvedValue(null);

      await expect(controller.patch('1', updateDto)).rejects.toThrow(NotFoundException);
    });
  });
});
