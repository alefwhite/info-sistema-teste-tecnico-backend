import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BrandOrmEntity } from '../../../brands/infrastructure/database/brand.orm-entity';

@Entity('models')
export class ModelOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ name: 'brand_id', type: 'uuid' })
  brandId!: string;

  @ManyToOne(() => BrandOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'brand_id' })
  brand!: BrandOrmEntity;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
