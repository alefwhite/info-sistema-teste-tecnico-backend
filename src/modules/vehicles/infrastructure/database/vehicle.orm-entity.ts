import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ModelOrmEntity } from '../../../models/infrastructure/database/model.orm-entity';

@Entity('vehicles')
export class VehicleOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'license_plate', type: 'varchar', length: 20, unique: true })
  licensePlate!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  chassis!: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  renavam!: string;

  @Column({ type: 'int' })
  year!: number;

  @Column({ name: 'model_id', type: 'uuid' })
  modelId!: string;

  @ManyToOne(() => ModelOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'model_id' })
  model!: ModelOrmEntity;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
