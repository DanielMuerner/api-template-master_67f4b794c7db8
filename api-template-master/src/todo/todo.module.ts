// todo.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoController } from './todo.controller/todo.controller';
import { TodoService } from './todo.service/todo.service';
import { Todo } from './dto/todo.entity';
import { AuthModule } from '../sample/modules/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Todo]), AuthModule],
  controllers: [TodoController],
  providers: [TodoService],
  exports: [TodoService],
})
export class TodoModule {}
