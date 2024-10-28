import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './TodoService';
import { Repository } from 'typeorm';
import { Todo } from './todo.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('TodoService', () => {
  let service: TodoService;
  let repository: Repository<Todo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getRepositoryToken(Todo),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({}),
            create: jest.fn().mockReturnValue({}),
            save: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
            delete: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
    repository = module.get<Repository<Todo>>(getRepositoryToken(Todo));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all todos', async () => {
    await expect(service.findAll()).resolves.toEqual([]);
    expect(repository.find).toHaveBeenCalled();
  });

  it('should return a single todo', async () => {
    const id = 1;
    await expect(service.findOne(id)).resolves.toEqual({});
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
  });

  it('should create a todo', async () => {
    const dto = { title: 'Test', description: 'Description' };
    repository.create = jest.fn().mockReturnValue(dto);
    repository.save = jest.fn().mockResolvedValue(dto);

    await expect(service.create(dto)).resolves.toEqual(dto);
    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(dto);
  });

  it('should update a todo', async () => {
    const id = 1;
    const dto = { title: 'Updated' };
    repository.findOne = jest.fn().mockResolvedValue(dto);
    repository.update = jest.fn().mockResolvedValue(null);

    await expect(service.update(id, dto)).resolves.toEqual(dto);
    expect(repository.update).toHaveBeenCalledWith(id, dto);
  });

  it('should delete a todo', async () => {
    const id = 1;
    repository.delete = jest.fn().mockResolvedValue(null);

    await service.remove(id);
    expect(repository.delete).toHaveBeenCalledWith(id);
  });
});
