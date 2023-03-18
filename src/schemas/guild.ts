import { Schema, model, Types, Model, HydratedDocument } from "mongoose";

interface RoleReactI2 {
    roleId: string;
}
type btn = { label: string; roleId: string };

interface RoleReactI {
    messageId?: string;
    name: string;
    reactions: btn[];
    createdAt?: Date;
}

interface methods {
    test(): string;
}

type Mod = Model<RoleReactI, {}, methods>;

const RoleReactSchema = new Schema<RoleReactI>(
    {
        messageId: { type: String, required: false },
        name: { type: String, required: true },
        reactions: [
            { label: { type: String, required: true }, roleId: String },
        ],
    },
    {
        timestamps: true,
    }
);

interface GuildI {
    _id: string;
    //guildId: string;
    roleReacts: RoleReactI[];
}

type GuildDocumentProps = {
    roleReacts: Types.DocumentArray<RoleReactI>;
    sortRoleReacts(): string;
};

type GuildModelType = Model<GuildI, {}, GuildDocumentProps>;
interface Gm extends GuildModelType {
    findOrCreate(
        id: string
    ): Promise<HydratedDocument<GuildI, GuildDocumentProps>>;
}
const GuildSchema = new Schema<GuildI, Gm, GuildDocumentProps>(
    {
        //guildId: { type: String, required: true, unique: true },
        _id: String,
        roleReacts: [RoleReactSchema],
    },
    {
        timestamps: true,
        statics: {
            findOrCreate(id) {
                const s = this;
                return this.findById(id, (err, result) => {
                    return result == null ? Guild.create({ _id: id }) : result;
                }).clone();
            },
        },
        methods: {
            sortRoleReacts() {
                this;
                return 32;
            },
        },
    }
);

const Guild = model<GuildI, Gm>("Guild", GuildSchema);
const RoleReact = model<RoleReactI>("RoleReact", RoleReactSchema);

export default Guild;
