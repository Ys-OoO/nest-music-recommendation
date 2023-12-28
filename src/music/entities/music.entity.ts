import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Music {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  mid: number;

  @Column({ type: 'varchar', length: 24, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 24, nullable: false })
  singer: string;

  @Column({ type: 'varchar', length: 255 })
  cover: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  video: string;
}
