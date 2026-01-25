import { BaseEntity } from 'src/common/core/models/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum ReferenceType {
    PRODUCT_IMG = 'PRODUCT_IMG',
}

export enum EntityType {
    PRODUCT = 'PRODUCT',
}

@Entity('object_store')
export class DocumentMetaInfo extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    refId: number;

    @Column({
        type: 'enum',
        enum: ReferenceType,
        nullable: false,
    })
    refType: ReferenceType;

    @Column({ nullable: false })
    entityId: number;

    @Column({
        type: 'enum',
        enum: EntityType,
        nullable: false,
    })
    entityType: EntityType;
}

