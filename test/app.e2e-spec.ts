import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/shared/exceptions/all-exceptions.filter';

describe('Fleet Management System (E2E)', () => {
  let app: INestApplication;
  let token: string;
  let brandId: string;
  let modelId: string;
  let vehicleId: string;

  beforeAll(async () => {
    // Set seed password before loading module
    process.env.DEFAULT_USER_PASSWORD = 'aivacol_admin_password';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth Flow', () => {
    it('/auth/login (POST) - should login successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ login: 'aivacol', password: 'aivacol_admin_password' })
        .expect(200);

      expect(response.body.data.accessToken).toBeDefined();
      token = response.body.data.accessToken;
    });

    it('/auth/login (POST) - should reject wrong credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ login: 'aivacol', password: 'wrong_password' })
        .expect(401);
    });
  });

  describe('Brands API', () => {
    it('/brands (POST) - should create brand', async () => {
      const response = await request(app.getHttpServer())
        .post('/brands')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'BMW' })
        .expect(201);

      expect(response.body.data.id).toBeDefined();
      brandId = response.body.data.id;
    });

    it('/brands (POST) - should reject duplicate name', async () => {
      await request(app.getHttpServer())
        .post('/brands')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'BMW' })
        .expect(409);
    });

    it('/brands (GET) - should list brands', async () => {
      const response = await request(app.getHttpServer())
        .get('/brands')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('/brands/:id (GET) - should find brand by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/brands/${brandId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.name).toBe('BMW');
    });
  });

  describe('Models API', () => {
    it('/models (POST) - should create model', async () => {
      const response = await request(app.getHttpServer())
        .post('/models')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Series 3', brandId })
        .expect(201);

      expect(response.body.data.id).toBeDefined();
      modelId = response.body.data.id;
    });

    it('/models (GET) - should list models', async () => {
      const response = await request(app.getHttpServer())
        .get('/models')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('Vehicles API', () => {
    it('/vehicles (POST) - should create vehicle', async () => {
      const response = await request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          licensePlate: 'BMW-9999',
          chassis: '9BWAAAAAA0A999999',
          renavam: '99999999999',
          year: 2023,
          modelId,
        })
        .expect(201);

      expect(response.body.data.id).toBeDefined();
      vehicleId = response.body.data.id;
    });

    it('/vehicles/:id (GET) - should find vehicle', async () => {
      const response = await request(app.getHttpServer())
        .get(`/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.licensePlate).toBe('BMW-9999');
    });

    it('/vehicles/:id (PATCH) - should update vehicle', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ licensePlate: 'BMW-8888' })
        .expect(200);

      expect(response.body.data.licensePlate).toBe('BMW-8888');
    });

    it('/vehicles/:id (DELETE) - should delete vehicle', async () => {
      await request(app.getHttpServer())
        .delete(`/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
    });
  });
});
