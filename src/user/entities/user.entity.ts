import { Column, Entity, PrimaryColumn } from 'typeorm';
export enum UserRole {
  ADMIN = 'admin',
  VISITOR = 'visitor',
}

@Entity()
export class User {
  @PrimaryColumn('uuid')
  uid: string;

  @Column({ type: 'varchar', length: 24, nullable: false })
  username: string;

  @Column({ type: 'varchar', length: 24, nullable: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VISITOR,
    nullable: true,
  })
  role: UserRole;
}
