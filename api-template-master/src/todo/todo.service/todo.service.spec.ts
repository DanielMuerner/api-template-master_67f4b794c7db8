import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Todo } from '../dto/todo.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';

describe('TodoService', () => {
  let service: TodoService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getRepositoryToken(Todo),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of todos', async () => {
      const expectedTodos = [{ id: 1, title: 'Test', description: 'Test desc', closed: false }];
      mockRepository.find.mockResolvedValue(expectedTodos);

      const result = await service.findAll();
      expect(result).toEqual(expectedTodos);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return todo when found', async () => {
      const mockTodo = { id: 1, title: 'Test', description: 'Test desc', closed: false };
      mockRepository.findOne.mockResolvedValue(mockTodo);

      const result = await service.findOne(1);
      expect(result).toEqual(mockTodo);
    });

    it('should throw NotFoundException when todo not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(1)).rejects.toThrow('We did not found a todo item with id 1!');
    });
  });

  describe('create', () => {
    it('should create a todo successfully', async () => {
      const createTodoDto: CreateTodoDto = {
        title: 'Test Todo',
        description: 'Test Description',
      };
      const mockTodo = {
        id: 1,
        ...createTodoDto,
        closed: false,
      };

      mockRepository.create.mockReturnValue(mockTodo);
      mockRepository.save.mockResolvedValue(mockTodo);

      const result = await service.create(createTodoDto);

      expect(result).toEqual(mockTodo);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createTodoDto,
        closed: false,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockTodo);
    });

    it('should throw BadRequestException when title is missing', async () => {
      const createTodoDto = {
        description: 'Test Description',
      } as CreateTodoDto;

      await expect(service.create(createTodoDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when description is missing', async () => {
      const createTodoDto = {
        title: 'Test Todo',
      } as CreateTodoDto;

      await expect(service.create(createTodoDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when save fails', async () => {
      const createTodoDto: CreateTodoDto = {
        title: 'Test Todo',
        description: 'Test Description',
      };

      mockRepository.create.mockReturnValue({});
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createTodoDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a todo successfully', async () => {
      const updateTodoDto: UpdateTodoDto = {
        title: 'Updated Title',
      };
      const mockTodo = {
        id: 1,
        title: 'Updated Title',
        description: 'Original Description',
        closed: false,
      };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(mockTodo);

      const result = await service.update(1, updateTodoDto);

      expect(result).toEqual(mockTodo);
      expect(mockRepository.update).toHaveBeenCalledWith(1, updateTodoDto);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('remove', () => {
    it('should remove a todo successfully', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when todo not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('transformToReturnDto', () => {
    it('should transform todo entity to return dto', () => {
      const todo: Todo = {
        id: 1,
        title: 'Test',
        description: 'Test desc',
        closed: false,
      };

      const result = service.transformToReturnDto(todo);

      expect(result).toEqual({
        id: todo.id,
        title: todo.title,
        description: todo.description,
        closed: todo.closed,
      });
    });
  });
});
