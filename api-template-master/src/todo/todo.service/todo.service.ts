// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from '../dto/todo.entity';
import { CreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';
import { ReturnTodoDto } from '../dto/return-todo.dto';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
  ) {}

  async findAll(): Promise<Todo[]> {
    return await this.todoRepository.find();
  }

  async findOne(id: number): Promise<Todo> {
    const entryFound = await this.todoRepository.findOne({ where: { id } });
    if (!entryFound) {
      // Now throws when NOT found
      throw new NotFoundException(`We did not found a todo item with id ${id}!`);
    }
    return entryFound;
  }

  async create(createTodoDto: CreateTodoDto): Promise<ReturnTodoDto> {
    try {
      if (!createTodoDto.description) {
        throw new BadRequestException('The required field description is missing in the object!');
      }

      if (!createTodoDto.title) {
        throw new BadRequestException('The required field title is missing in the object!');
      }
      const todo = this.todoRepository.create({
        ...createTodoDto,
        closed: false,
      });

      const savedTodo = await this.todoRepository.save(todo);
      return this.transformToReturnDto(savedTodo);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create todo. Please check your input.');
    }
  }

  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    await this.todoRepository.update(id, updateTodoDto);
    return this.todoRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    const result = await this.todoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`We did not found a todo item with id ${id}!`);
    }
  }

  public transformToReturnDto(todo: Todo): ReturnTodoDto {
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      closed: todo.closed,
    };
  }
}
