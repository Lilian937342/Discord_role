import { Schema, model, Date } from "mongoose";

interface RoleReactI {
    roleId: string;
}

const RoleReactSchema = new Schema<RoleReactI>(
    {
        roleId: { type: String, required: true, unique: true },
    },
    { timestamps: true, _id: false }
);

const RoleReact = model("Guild", RoleReactSchema);

export default RoleReact;
