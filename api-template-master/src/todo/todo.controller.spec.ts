import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './TodoController';
import { TodoService } from './TodoService';
import { CreateTodoDto } from './CreateDTO';
import { UpdateTodoDto } from './UpdateDTO';

describe('TodoController', () => {
  let controller: TodoController;
  let service: TodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({}),
            create: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<TodoController>(TodoController);
    service = module.get<TodoService>(TodoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an array of todos', async () => {
    expect(await controller.findAll()).toEqual([]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return a single todo', async () => {
    const id = 1;
    expect(await controller.findOne(id)).toEqual({});
    expect(service.findOne).toHaveBeenCalledWith(id);
  });

  it('should create a todo', async () => {
    const dto: CreateTodoDto = { title: 'Test', description: 'Description' };
    expect(await controller.create(dto)).toEqual({});
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should update a todo', async () => {
    const id = 1;
    const dto: UpdateTodoDto = { title: 'Updated' };
    expect(await controller.update(id, dto)).toEqual({});
    expect(service.update).toHaveBeenCalledWith(id, dto);
  });

  it('should delete a todo', async () => {
    const id = 1;
    await controller.remove(id);
    expect(service.remove).toHaveBeenCalledWith(id);
  });
});
