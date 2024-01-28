const BotBase = require('./bot-base');
const BybitApi = require('../bybit-api')
const { MESSAGES } = require('./messages');
const { BUTTONS } = require('./buttons');

module.exports = class BybitBot extends BotBase {
    constructor(config) {
        super(config.botUsername, config.botToken);
        this.config = config;
        this.bybitApi = new BybitApi(config.bybit.apiKey, config.bybit.apiSecret);
    }

    async doSetup() {
        await super.doSetup();
        await this.bot.setMyDescription({ description: MESSAGES.BYBIT_BOT.WELCOME, parse_mode: 'Markdown' })

        this.bot.onText(/\/start/, async (message) => {
            const chatId = message.chat.id;
            const value = await this.db.getObjectDefault(`/clients/${message.chat.id}`, '');
            if (value === '') {
                await this.db.push(`/clients/${chatId}`, { uid: '', registered: false });
                this.log(`Пользователь с ${chatId} нажал /start, добавляем в базу данных`);
            } else {
                this.log(`Пользователь с ${chatId} нажал /start, но он уже есть в базе данных`);
            }

            await this.sendMessageWithException(chatId, MESSAGES.BYBIT_BOT.INTRO, [
                [ { text: BUTTONS.BYBIT_BOT.JOIN.text } ]
            ]);
        });

        const howToJoinMessage = MESSAGES.BYBIT_BOT.HOW_TO_JOIN
            .replace('REFERRAL_LINK', this.config.bybit.referralLink);
        this.bot.onText(BUTTONS.BYBIT_BOT.JOIN.regex, async (message) => {
            await this.sendMessageWithException(message.chat.id, howToJoinMessage, [
                [ { text: BUTTONS.BYBIT_BOT.DONE.text } ]
            ]);
        });

        this.bot.onText(BUTTONS.BYBIT_BOT.DONE.regex, async (message) => {
            await this.sendMessageRemoveKeyboardWithException(message.chat.id, MESSAGES.BYBIT_BOT.HOW_TO_CHECK_UID);
        });

        this.bot.on('message', async (message) => {
            const text = message.text ? message.text : '';
            const foundUid = /^\d+$/.test(text);
            if (foundUid) {
                this.log('Проверяю uid: ' + text);
                try {
                    const response = await this.bybitApi.getAffCustomerInfo(text);
                    this.log(response?.data, true);
                    if (response?.data?.result?.uid === text) {
                        const chatId = message.chat.id;
                        const value = await this.db.getObjectDefault(`/clients/${chatId}`, '');
                        this.log('Найдено значение: ' + JSON.stringify(value));
                        await this.db.push(`/clients/${chatId}`, { uid: text, registered: true });
                        this.log(`Клиент c chatId: ${chatId} и uid: ${text} подтвердил uid`);

                        await this.sendMessageRemoveKeyboardWithException(message.chat.id, MESSAGES.BYBIT_BOT.REGISTRATION_OK);
                    } else {
                        await this.sendMessageRemoveKeyboardWithException(message.chat.id,
                            MESSAGES.BYBIT_BOT.REGISTRATION_FAILED
                                .replace('REFERRAL_LINK', this.config.bybit.referralLink));
                    }
                } catch (e) {
                    this.log('Ошибка при обращении к bybit API ' + e);
                    await this.sendMessageWithException(message.chat.id,
                        'Сервис проверки bybit временно недоступен, попробуйте позже', []);
                }
            } else {
                const chatId = message.chat.id;
                const lock = await this.db.getObjectDefault(`/locks/${chatId}`, { locked: false });
                if (lock?.locked) {
                    this.log('onText заблокирован admin bot-ом для ' + chatId);
                    await this.db.push(`/locks/${chatId}`, { locked: false });
                    return;
                }

                const buttonClicked = BUTTONS.BYBIT_BOT.JOIN.regex.test(text)
                    || BUTTONS.BYBIT_BOT.DONE.regex.test(text)
                    || /\/start/.test(text);
                if (!buttonClicked) {
                    await this.sendMessageRemoveKeyboardWithException(message.chat.id,
                        MESSAGES.BYBIT_BOT.INVALID_UID
                            .replace('REFERRAL_LINK', this.config.bybit.referralLink));
                }
            }
        });

    }

    async sendMessageToClients(value, filePaths) {
        const message = value.message;
        const sendToClients = value.sendToClients;
        const mediaGroup = value.mediaGroupId !== undefined
        const buttonLabel = value.buttonLabel;
        const buttonUrl = value.buttonUrl;

        const clients = await this.db.getData(`/clients`);
        const chatIds = Object.keys(clients);

        this.log(`Готовим отправку для клиентов: ${sendToClients}`);
        let totalSent = 0;
        let totalFailed = 0;
        for (let chatId of chatIds) {
            if (sendToClients === BUTTONS.ADMIN_BOT.SEND_TO_UID_CLIENTS.text
                && clients[chatId].registered !== true) {
                this.log(chatId + ': ' + JSON.stringify(clients[chatId]));
                this.log(`Не подходит под рассылку ${chatId}, нужен зарегистрированный`);
                continue;
            }

            if (sendToClients === BUTTONS.ADMIN_BOT.SEND_TO_NO_UID_CLIENTS.text
                && clients[chatId].registered === true) {
                this.log(chatId + ': ' + JSON.stringify(clients[chatId]));
                this.log(`Не подходит под рассылку ${chatId}, нужен незарегистрированный`);
                continue;
            }

            try {
                await this.db.push(`/locks/${chatId}`, { locked: true });
                if (message?.caption) {
                    if (mediaGroup) {
                        let captionSet = false;
                        const media = filePaths.map(fs => {
                            const res = {
                                type: 'photo',
                                media: fs,
                                caption: !captionSet ? message.caption : undefined,
                                caption_entities: !captionSet ? message['caption_entities'] : undefined
                            }

                            captionSet = true;
                            return res;
                        });
                        await this.bot.sendMediaGroup(chatId, media);
                    } else {
                        const caption = this.getTextFromEntities(message.caption, message.caption_entities);
                        await this.bot.sendPhoto(chatId, filePaths[0],
                            buttonLabel && buttonUrl ? {
                                caption: caption,
                                parse_mode: 'HTML',
                                reply_markup: {
                                    inline_keyboard: [[{ text: buttonLabel, url: buttonUrl }]],
                                }
                            } : {
                                caption: caption,
                                parse_mode: 'HTML'
                            });
                    }
                } else if (message?.text) {
                    await this.bot.sendMessage(chatId, message?.text,
                        buttonLabel && buttonUrl ? {
                            entities: message?.entities,
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: buttonLabel, url: buttonUrl }]
                                ],
                            }
                        } : {
                            entities: message?.entities,
                            parse_mode: undefined
                        });
                }

                totalSent++;
                await this.db.push(`/locks/${chatId}`, { locked: false });
                this.log(`Рассылка отправлена для ${chatId}: ` + JSON.stringify(clients[chatId]));
            } catch (e) {
                totalFailed++;
                await this.db.push(`/locks/${chatId}`, { locked: false });
                this.log(`Ошибка при отправке сообщения для ${chatId}: ${JSON.stringify(clients[chatId])} в рассылке: ` + e);
            }
        }

        this.log(`Завершена отправка для клиентов: ${sendToClients}, успешно: ${totalSent}, неуспешно: ${totalFailed}`);
    }

    getTextFromEntities(text, entities) {
        if (!entities || !text) {
            return text;
        }

        let tags = [];
        entities.forEach((entity) => {
            const startTag = this.getTag(entity, text);
            let searchTag = tags.filter((tag) => tag.index === entity.offset);
            if (searchTag.length > 0 && startTag) {
                searchTag[0].tag += startTag;
            } else {
                tags.push({
                    index: entity.offset,
                    tag: startTag
                });
            }

            const closeTag = startTag?.indexOf('<a ') === 0 ? '</a>' : '</' + startTag?.slice(1);
            searchTag = tags.filter((tag) => tag.index === entity.offset + entity.length);
            if (searchTag.length > 0) {
                searchTag[0].tag = closeTag + searchTag[0].tag;
            } else {
                tags.push({
                    index: entity.offset + entity.length,
                    tag: closeTag
                });
            }
        });

        let html = '';
        for (let i = 0; i < text.length; i++) {
            const tag = tags.filter((tag) => tag.index === i);
            tags = tags.filter((tag) => tag.index !== i);
            if (tag.length > 0) {
                html += tag[0].tag;
            }

            html += text[i];
        }
        if (tags.length > 0) {
            html += tags[0].tag;
        }

        return html;
    }

    getTag(entity, text) {
        const entityText = text.slice(entity.offset, entity.offset + entity.length);
        switch (entity.type) {
            case 'bold':
                return `<strong>`;
            case 'text_link':
                return `<a href="${entity.url}" target="_blank">`;
            case 'url':
                return `<a href="${entityText}" target="_blank">`;
            case 'italic':
                return `<em>`;
            case 'code':
                return `<code>`;
            case 'strikethrough':
                return `<s>`;
            case 'underline':
                return `<u>`;
            case 'pre':
                return `<pre>`;
            case 'mention':
                return `<a href="https://t.me/${entityText.replace('@', '')}" target="_blank">`;
            case 'email':
                return `<a href="mailto:${entityText}">`;
            case 'phone_number':
                return `<a href="tel:${entityText}">`;
        }
    }

    async sendMessageRemoveKeyboardWithException(chatId, text) {
        try {
            await this.bot.sendMessage(chatId,
                text, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        remove_keyboard: true
                    }
                }
            );
        } catch (e) {
            this.log('Ошибка при отправке сообщения: ' + e);
        }
    }
}