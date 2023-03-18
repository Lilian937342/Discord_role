import { ColorResolvable } from "discord.js";

export const getRandomColor = () => {
     return Math.floor(Math.random() * 16777215).toString(16) as ColorResolvable;
}