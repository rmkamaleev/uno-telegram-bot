import dotenv from "dotenv";
dotenv.config();

export const telegramBotToken = process.env.BOT_TOKEN as string;