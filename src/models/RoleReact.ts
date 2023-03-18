import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class RoleReact {

    @PrimaryColumn({ type: "varchar" })
    guildId: string;

    @PrimaryColumn({ type: "varchar" })
    roleId: string;

    @Column({ type: "varchar" })
    name: string;

}
