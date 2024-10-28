import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoModule } from './todo/TodoModule';  // Pfad anpassen

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DATABASE_NAME || 'database/api.db',
      dropSchema: true,
      autoLoadEntities: true,
      synchronize: true,
      logging: process.env.DATABASE_LOG?.toLowerCase() === 'true' || false,
    }),
    TodoModule,
  ],
})
export class AppModule {}
