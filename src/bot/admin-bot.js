const BotBase = require('./bot-base');
const { MESSAGES } = require('./messages');
const { BUTTONS } = require('./buttons');

module.exports = class AdminBot extends BotBase {
    constructor(botUsername, botToken, bot1, bot2, downloadFolder, adminIds) {
        super(botUsername, botToken);
        this.bot1 = bot1;
        this.bot2 = bot2;
        this.downloadFolder = downloadFolder;
        this.adminChatIds = adminIds.split(', ');
    }

    async doSetup() {
        await super.doSetup();
        await this.bot.setMyDescription({ description: MESSAGES.ADMIN_BOT.WELCOME, parse_mode: 'Markdown' })

        this.log(`Указаны админы: ${this.adminChatIds}`);

        this.handleOnTextWithException(/\/start/, MESSAGES.ADMIN_BOT.INTRO,
            [[ { text: BUTTONS.ADMIN_BOT.PREPARE_MESSAGES.text } ]],
            async (message) => {
                await this.db.push(`/actions/${message.chat.id}`, {}, true);
            });
        this.handleOnTextWithException(BUTTONS.ADMIN_BOT.CANCEL.regex, MESSAGES.ADMIN_BOT.INTRO,
            [[ { text: BUTTONS.ADMIN_BOT.PREPARE_MESSAGES.text } ]],
            async (message) => {
                await this.db.push(`/actions/${message.chat.id}`, {}, true);
            });

        this.handleOnTextWithException(BUTTONS.ADMIN_BOT.PREPARE_MESSAGES.regex, MESSAGES.ADMIN_BOT.SELECT_BOTS,
            [
                [ { text: BUTTONS.ADMIN_BOT.SELECT_BOT1.text }, { text: BUTTONS.ADMIN_BOT.SELECT_BOT2.text } ],
                [ { text: BUTTONS.ADMIN_BOT.SELECT_ALL_BOTS.text } ],
                [ { text: BUTTONS.ADMIN_BOT.CANCEL.text } ]
            ], async (message) => {
                await this.db.push(`/actions/${message.chat.id}`, {}, true);
            });

        this.handleOnTextWithException(BUTTONS.ADMIN_BOT.SELECT_BOT1.regex, MESSAGES.ADMIN_BOT.SELECT_CLIENTS,
            [
                [ { text: BUTTONS.ADMIN_BOT.SEND_TO_UID_CLIENTS.text } ],
                [ { text: BUTTONS.ADMIN_BOT.SEND_TO_NO_UID_CLIENTS.text } ],
                [ { text: BUTTONS.ADMIN_BOT.SEND_TO_ALL_CLIENTS.text } ],
                [ { text: BUTTONS.ADMIN_BOT.CANCEL.text } ]
            ], async (message) => {
                await this.db.push(`/actions/${message.chat.id}`, { sendToBots: message.text }, true);
            });
        this.handleOnTextWithException(BUTTONS.ADMIN_BOT.SELECT_BOT2.regex, MESSAGES.ADMIN_BOT.SELECT_CLIENTS,
            [
                [ { text: BUTTONS.ADMIN_BOT.SEND_TO_UID_CLIENTS.text } ],
                [ { text: BUTTONS.ADMIN_BOT.SEND_TO_NO_UID_CLIENTS.text } ],
                [ { text: BUTTONS.ADMIN_BOT.SEND_TO_ALL_CLIENTS.text } ],
                [ { text: BUTTONS.ADMIN_BOT.CANCEL.text } ]
            ], async (message) => {
                await this.db.push(`/actions/${message.chat.id}`, { sendToBots: message.text }, true);
            });
        this.handleOnTextWithException(BUTTONS.ADMIN_BOT.SELECT_ALL_BOTS.regex, MESSAGES.ADMIN_BOT.SELECT_CLIENTS,
            [
                [ { text: BUTTONS.ADMIN_BOT.SEND_TO_UID_CLIENTS.text } ],
                [ { text: BUTTONS.ADMIN_BOT.SEND_TO_NO_UID_CLIENTS.text } ],
                [ { text: BUTTONS.ADMIN_BOT.SEND_TO_ALL_CLIENTS.text } ],
                [ { text: BUTTONS.ADMIN_BOT.CANCEL.text } ]
            ], async (message) => {
                await this.db.push(`/actions/${message.chat.id}`, { sendToBots: message.text }, true);
            });

        this.handleOnTextWithException(BUTTONS.ADMIN_BOT.SEND_TO_UID_CLIENTS.regex, MESSAGES.ADMIN_BOT.APPLY_TEXT,
            [
                [ { text: BUTTONS.ADMIN_BOT.APPLY_TEXT.text } ],
                [ { text: BUTTONS.ADMIN_BOT.CANCEL.text } ]
            ], async (message) => {
                let value = await this.db.getObjectDefault(`/actions/${message.chat.id}`, {});
                value.waitingForText = true;
                value.sendToClients = message.text;
                await this.db.push(`/actions/${message.chat.id}`, value, true);
            });
        this.handleOnTextWithException(BUTTONS.ADMIN_BOT.SEND_TO_NO_UID_CLIENTS.regex, MESSAGES.ADMIN_BOT.APPLY_TEXT,
            [
                [ { text: BUTTONS.ADMIN_BOT.APPLY_TEXT.text } ],
                [ { text: BUTTONS.ADMIN_BOT.CANCEL.text } ]
            ], async (message) => {
                let value = await this.db.getObjectDefault(`/actions/${message.chat.id}`, {});
                value.waitingForText = true;
                value.sendToClients = message.text;
                await this.db.push(`/actions/${message.chat.id}`, value, true);
            });
        this.handleOnTextWithException(BUTTONS.ADMIN_BOT.SEND_TO_ALL_CLIENTS.regex, MESSAGES.ADMIN_BOT.APPLY_TEXT,
            [
                [ { text: BUTTONS.ADMIN_BOT.APPLY_TEXT.text } ],
                [ { text: BUTTONS.ADMIN_BOT.CANCEL.text } ]
            ], async (message) => {
                let value = await this.db.getObjectDefault(`/actions/${message.chat.id}`, {});
                value.waitingForText = true;
                value.sendToClients = message.text;
                await this.db.push(`/actions/${message.chat.id}`, value, true);
            });

        this.handleOnTextWithException(BUTTONS.ADMIN_BOT.APPLY_TEXT.regex, MESSAGES.ADMIN_BOT.NEED_BUTTON,
            [
                [ { text: BUTTONS.ADMIN_BOT.NEED_BUTTON.text }, { text: BUTTONS.ADMIN_BOT.NO_BUTTON.text } ],
                [ { text: BUTTONS.ADMIN_BOT.CANCEL.text } ]
            ], (message) => {}, async (message) => {
                let value = await this.db.getObjectDefault(`/actions/${message.chat.id}`, {});
                return value?.waitingForText !== false;
            });

        this.bot.on('message', async (message) => {
            const chatId = message.chat.id;
            if (!this.userHasAccess(chatId)) {
                this.log(`Пользователя с ${chatId} нет в списке, команда не будет выполнена`);
                return;
            }

            const text = message.text;
            let value = await this.db.getObjectDefault(`/actions/${message.chat.id}`, {});
            if (value?.waitingForText === false && message['media_group_id'] !== undefined
                && message['media_group_id'] === value?.mediaGroupId) {
                value.otherMessages = value.otherMessages && value.otherMessages.length > 0 ? value.otherMessages : [];
                value.otherMessages.push(message);
            }

            if (value?.waitingForText === true && (text !== BUTTONS.ADMIN_BOT.SEND_TO_UID_CLIENTS.text
                && text !== BUTTONS.ADMIN_BOT.SEND_TO_ALL_CLIENTS.text
                && text !== BUTTONS.ADMIN_BOT.CANCEL.text
                && text !== BUTTONS.ADMIN_BOT.APPLY_TEXT.text)) {
                value.waitingForText = false;
                value.message = message;
                value.mediaGroupId = message['media_group_id']
                await this.db.push(`/actions/${message.chat.id}`, value, true);
                await this.sendMessageWithException(message.chat.id, MESSAGES.ADMIN_BOT.DO_APPLY_TEXT, [
                    [ { text: BUTTONS.ADMIN_BOT.APPLY_TEXT.text } ],
                    [ { text: BUTTONS.ADMIN_BOT.CANCEL.text } ]
                ]);
            }

            if (value?.waitingForText === true && text === BUTTONS.ADMIN_BOT.APPLY_TEXT.text) {
                await this.sendMessageWithException(message.chat.id, MESSAGES.ADMIN_BOT.CHECK_AND_APPLY_TEXT, [
                    [ { text: BUTTONS.ADMIN_BOT.APPLY_TEXT.text } ],
                    [ { text: BUTTONS.ADMIN_BOT.CANCEL.text } ]
                ])
            }

            if (value?.waitingForText !== true
                && value?.waitingForButtonLabel === true
                && text !== BUTTONS.ADMIN_BOT.NEED_BUTTON.text) {
                value.buttonLabel = message?.text;
                value.waitingForButtonLabel = false;
                await this.db.push(`/actions/${message.chat.id}`, value, true);
                await this.sendMessageWithException(message.chat.id, MESSAGES.ADMIN_BOT.DO_APPLY_BUTTON_LABEL, [
                    [ { text: BUTTONS.ADMIN_BOT.SAVE_BUTTON_LABEL.text } ],
                    [ { text: BUTTONS.ADMIN_BOT.CANCEL.text } ]
                ]);
            }

            if (value?.waitingForText !== true
                && value?.waitingForButtonLabel !== true
                && value?.waitingForButtonUrl === true
                && text !== BUTTONS.ADMIN_BOT.SAVE_BUTTON_LABEL.text) {
                value.buttonUrl = message?.text;
                value.waitingForButtonUrl = false;
                await this.db.push(`/actions/${message.chat.id}`, value, true);
                await this.sendMessageWithException(message.chat.id, MESSAGES.ADMIN_BOT.DO_APPLY_BUTTON_URL, [
                    [ { text: BUTTONS.ADMIN_BOT.SAVE_BUTTON_URL.text } ],
                    [ { text: BUTTONS.ADMIN_BOT.CANCEL.text } ]
                ]);
            }
        });

        this.handleOnTextWithException(BUTTONS.ADMIN_BOT.NEED_BUTTON.regex, MESSAGES.ADMIN_BOT.APPLY_BUTTON_LABEL,
            [
                [ { text: BUTTONS.ADMIN_BOT.SAVE_BUTTON_LABEL.text } ],
                [ { text: BUTTONS.ADMIN_BOT.CANCEL.text } ]
            ], async (message) => {
                let value = await this.db.getObjectDefault(`/actions/${message.chat.id}`, {});
                value.waitingForButtonLabel = true;
                await this.db.push(`/actions/${message.chat.id}`, value, true);
            });
        this.handleOnTextWithException(BUTTONS.ADMIN_BOT.SAVE_BUTTON_LABEL.regex, MESSAGES.ADMIN_BOT.APPLY_BUTTON_URL,
            [
                [ { text: BUTTONS.ADMIN_BOT.SAVE_BUTTON_URL.text } ],
                [ { text: BUTTONS.ADMIN_BOT.CANCEL.text } ]
            ], async (message) => {
                let value = await this.db.getObjectDefault(`/actions/${message.chat.id}`, {});
                value.waitingForButtonUrl = true;
                await this.db.push(`/actions/${message.chat.id}`, value, true);
            });

        this.handleOnTextWithException(BUTTONS.ADMIN_BOT.NO_BUTTON.regex, MESSAGES.ADMIN_BOT.START_SENDING,
            [
                [ { text: BUTTONS.ADMIN_BOT.START_MESSAGE_SENDING.text } ],
                [ { text: BUTTONS.ADMIN_BOT.CANCEL.text } ]
            ]);
        this.handleOnTextWithException(BUTTONS.ADMIN_BOT.SAVE_BUTTON_URL.regex, MESSAGES.ADMIN_BOT.START_SENDING,
            [
                [ { text: BUTTONS.ADMIN_BOT.START_MESSAGE_SENDING.text } ],
                [ { text: BUTTONS.ADMIN_BOT.CANCEL.text } ]
            ]);

        this.handleOnTextWithException(BUTTONS.ADMIN_BOT.START_MESSAGE_SENDING.regex, MESSAGES.ADMIN_BOT.MESSAGES_SENT,
            [
                [ { text: BUTTONS.ADMIN_BOT.PREPARE_MESSAGES.text } ]
            ], async (message) => {
                let value = await this.db.getObjectDefault(`/actions/${message.chat.id}`, {});
                const fileIds = this.getFileIds(value);
                let filePaths = [];
                for (let fileId of fileIds) {
                    filePaths.push(await this.bot.downloadFile(fileId, this.downloadFolder));
                }

                console.log(filePaths);

                if (value?.message?.chat?.id && value?.message?.['message_id']) {
                    if (value.sendToBots === BUTTONS.ADMIN_BOT.SELECT_BOT1.text
                        || value.sendToBots === BUTTONS.ADMIN_BOT.SELECT_ALL_BOTS.text) {

                        await this.bot1.sendMessageToClients(value, filePaths);
                    }

                    if (value.sendToBots === BUTTONS.ADMIN_BOT.SELECT_BOT2.text
                        || value.sendToBots === BUTTONS.ADMIN_BOT.SELECT_ALL_BOTS.text) {

                        await this.bot2.sendMessageToClients(value, filePaths);
                    }
                }
            });
    }

    getFileIds(value) {
        let fileIds = [];
        if (value.message.photo !== undefined && value.message.photo.length > 0) {
            fileIds.push(value.message.photo[value.message.photo.length - 1]['file_id']);
        }

        if (value.otherMessages !== undefined && value.otherMessages.length > 0) {
            for (let otherMessage of value.otherMessages) {
                fileIds.push(otherMessage.photo[otherMessage.photo.length - 1]['file_id']);
            }
        }

        return fileIds;
    }

    userHasAccess(chatId) {
        return chatId && this.adminChatIds.includes(chatId + '');
    }

    handleOnTextWithException(regexp, text, showButtons, doSomeProcessing, skipCondition) {
        this.bot.onText(regexp, async (message) => {
            const chatId = message.chat.id;
            if (!this.userHasAccess(chatId)) {
                this.log(`Пользователя с ${chatId} нет в списке, команда не будет выполнена`);
                return;
            }

            if (skipCondition !== undefined && await skipCondition(message) === true) {
                this.log(`[${chatId}] не прошел по условию этап: ${regexp}`);
                return;
            }

            this.log(`[${chatId}] запущен этап: ${regexp}`);
            try {
                if (doSomeProcessing) {
                    doSomeProcessing(message);
                }

                await this.bot.sendMessage(chatId,
                    text, {
                        parse_mode: 'Markdown',
                        reply_markup: {
                            keyboard: showButtons,
                            resize_keyboard: true,
                            one_time_keyboard: true,
                        }
                    }
                );
            } catch (e) {
                this.log('Ошибка при отправке сообщения: ' + e);
                await this.bot.sendMessage(chatId, 'Ошибка при отправке сообщения: ' + e);
            }
        });
    }

}