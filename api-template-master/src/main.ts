import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as os from 'os';
import * as pk from 'pkginfo';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

pk(module);

const serverProtocol = process.env.SERVER_PROTOCOL || 'http';
const httpInterface = process.env.SERVER_LISTEN_ON || '0.0.0.0';
const accessServer = process.env.URI_SERVER || os.hostname();
const port = process.env.SERVER_PORT || 3000;

const apiName = process.env.API_NAME || 'api';

// Daten aus package.json
const { name, version, description, author, license } = module.exports;

// Autor-Informationen aufteilen
const [authorName, authorWebsite, authorEmail] = author.split('|');

async function bootstrap() {
  const logger = new Logger('bootstrap');

  const app = await NestFactory.create(AppModule, { cors: true });

  // Swagger-Konfiguration mit Daten aus package.json
  const config = new DocumentBuilder()
    .setTitle(name || 'API Documentation')
    .setDescription(description || 'API description and usage documentation')
    .setVersion(version || '1.0')
    .setContact(authorName || 'Author', authorWebsite || '', authorEmail || '')
    .setLicense(license || 'MIT', `${serverProtocol}://${accessServer}:${port}/license`)
    .addServer(`${serverProtocol}://${accessServer}:${port}`)
    .addBearerAuth() // Bearer-Authentifizierung hinzufügen
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(apiName, app, document);

  // Externe Dokumentation im JSON-Format unter /api-json verfügbar machen
  app.use('/api-json', (req, res) => {
    res.json(document);
  });

  await app.listen(port, httpInterface);

  logger.debug(`Der Server ist jetzt erreichbar unter: ${serverProtocol}://${accessServer}:${port}`);
  logger.debug(
    `Die API-Dokumentation in der Version ${version} ist erreichbar unter: ${serverProtocol}://${accessServer}:${port}/${apiName}`,
  );
}
bootstrap().finally();
