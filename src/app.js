require('dotenv').config()
const BybitBot = require('./bot/bybit-bot');
const AdminBot = require('./bot/admin-bot');

class App {
    async start() {
        this.bybitBot1 = new BybitBot({
            botUsername: process.env.BOT1_USERNAME,
            botToken: process.env.BOT1_TOKEN,
            bybit: {
                apiKey: process.env.BOT1_BYBIT_API_KEY,
                apiSecret: process.env.BOT1_BYBIT_API_SECRET,
                referralLink: process.env.BOT1_BYBIT_REFERRAL_LINK
            }
        });
        await this.bybitBot1.doSetup();

        this.bybitBot2 = new BybitBot({
            botUsername: process.env.BOT2_USERNAME,
            botToken: process.env.BOT2_TOKEN,
            bybit: {
                apiKey: process.env.BOT2_BYBIT_API_KEY,
                apiSecret: process.env.BOT2_BYBIT_API_SECRET,
                referralLink: process.env.BOT2_BYBIT_REFERRAL_LINK
            }
        });
        await this.bybitBot2.doSetup();

        this.adminBot = new AdminBot(process.env.ADMIN_BOT_USERNAME, process.env.ADMIN_BOT_TOKEN,
            this.bybitBot1, this.bybitBot2, process.env.DOWNLOAD_FOLDER);
        await this.adminBot.doSetup();

    }

}

new App().start();