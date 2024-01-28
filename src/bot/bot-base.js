const TelegramBot = require('node-telegram-bot-api');
const { Config, JsonDB } = require('node-json-db');

module.exports = class BotBase {
    constructor(botUsername, botToken) {
        this.botUsername = botUsername;
        this.botToken = botToken;
    }

    async doSetup() {
        const dbName = `${this.botUsername}-db.json`;
        this.db = new JsonDB(new Config(dbName, true, true, '/'));
        this.log("Инициализирована база " + dbName);

        this.bot = new TelegramBot(this.botToken, { polling: true });
    }

    log(message, json) {
        console.log(`[${this.botUsername}] ${json ? JSON.stringify(message) : message}`);
    }

    async sendMessageWithException(chatId, text, showButtons) {
        try {
            await this.bot.sendMessage(chatId, text, {
                parse_mode: 'Markdown',
                reply_markup: {
                    keyboard: showButtons,
                    resize_keyboard: true,
                    one_time_keyboard: true,
                }
            });
        } catch (e) {
            this.log('Ошибка при отправке сообщения: ' + e);
        }
    }

}
