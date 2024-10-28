import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TodoModule } from './todo/TodoModule';
import { AuthModule } from './todo/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Lädt die Umgebungsvariablen und macht sie global verfügbar
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DATABASE_NAME || 'database/api.db', // Datenbankname aus der .env
      dropSchema: true, // Löscht die Datenbank bei jedem Start, nur für die Entwicklung verwenden!
      autoLoadEntities: true, // Lädt automatisch alle registrierten Entities
      synchronize: true, // Synchronisiert die Tabellenstruktur automatisch, nur für die Entwicklung
      logging: process.env.DATABASE_LOG?.toLowerCase() === 'true' || false, // Logging über Umgebungsvariable steuern
    }),
    TodoModule,
    AuthModule, // Importiert das AuthModule für JWT-basierte Authentifizierung
  ],
})
export class AppModule {}
