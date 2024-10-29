import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Patch,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { TodoService } from '../todo.service/todo.service';
import { CreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';
import { ReturnTodoDto } from '../dto/return-todo.dto';
import { UserService } from '../../sample/modules/auth/user.service/user.service';
import { CurrentUser } from '../../sample/decorators/current-user/current-user.decorator';
import { UserInfoDto } from '../../sample/generic.dtos/userDtoAndEntity';

@Controller('todo')
export class TodoController {
  constructor(
    private readonly todoService: TodoService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.todoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.todoService.findOne(id);
  }

  @Post()
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todoService.create(createTodoDto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todoService.update(id, updateTodoDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: UserInfoDto): Promise<ReturnTodoDto> {
    const userEntity = await this.userService.findOne(user.username);
    console.log(userEntity.roles);
    if (!userEntity.roles.includes('admin')) {
      throw new ForbiddenException('You have to be member of the role admin to call this method!');
    }
    const todo = await this.todoService.findOne(+id);
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    await this.todoService.remove(+id);

    const returnTodoDto = new ReturnTodoDto();
    returnTodoDto.id = todo.id;
    returnTodoDto.title = todo.title;
    returnTodoDto.description = todo.description;

    return returnTodoDto;
  }
  @Patch(':id')
  async patch(@Param('id') id: string, @Body() updateDto: UpdateTodoDto): Promise<ReturnTodoDto> {
    const todo = await this.todoService.update(+id, updateDto);
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    return todo;
  }
}
