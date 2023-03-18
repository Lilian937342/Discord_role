import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class TempRole {
    @PrimaryColumn({ type: "varchar" })
    userId: string;

    @PrimaryColumn({ type: "varchar" })
    guildId: string;

    @PrimaryColumn({ type: "varchar" })
    roleId: string;

    @Column({ type: "datetime" })
    expire: Date;

    @Column({ type: "varchar" })
    channelId: string;
}
