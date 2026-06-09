import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient, Db } from 'mongodb';

@Injectable()
export class MongoService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MongoService.name);
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const mongoUri = this.configService.get<string>('mongo.uri') ?? 'mongodb://localhost:27017/fleet_audit';
    try {
      this.client = new MongoClient(mongoUri, {
        connectTimeoutMS: 2000,
        serverSelectionTimeoutMS: 2000,
      });
      await this.client.connect();
      this.db = this.client.db();
      this.isConnected = true;
      this.logger.log('Connected to MongoDB successfully');
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB. Auditing will fail-safe.', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.close();
    }
  }

  async insertLog(collectionName: string, document: any): Promise<void> {
    if (!this.isConnected || !this.db) {
      this.logger.warn(`MongoDB not connected. Skipping log: ${JSON.stringify(document)}`);
      return;
    }
    try {
      const collection = this.db.collection(collectionName);
      await collection.insertOne(document);
    } catch (error) {
      this.logger.error('Failed to write log to MongoDB', error);
    }
  }

  getDb(): Db | null {
    return this.db;
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}
