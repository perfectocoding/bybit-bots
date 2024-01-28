const { BUTTONS } = require('./buttons');

exports.MESSAGES = {
    BYBIT_BOT: {
        WELCOME:
            'Добро пожаловать. Чтобы присоединиться к нашему проекту нажмите кнопку НАЧАТЬ',

        INTRO:
            '*📍CryptoClub - уникальный в своём роде проект, который перевернет ваше понимание рынка криптовалют!*\n' +
            '\n' +
            'Это бесплатный 3-месячный марафон, где мы вместе с командой будем торговать криптой и готовить наши крипто-портфели к бурному 2024 году\n' +
            '\n' +
            'Что вы найдете внутри:\n' +
            '\n' +
            '• Персональные сделки и аналитика.\n' +
            '• Полноценное обучение торговле.\n' +
            '• Авторские торговые связки для максимального профита.\n' +
            '• 3 готовых портфеля для старта работы.\n' +
            '• Рекомендации по работе с личным наставником. Персональное общение.\n' +
            '\n' +
            '*2024 год - год криптовалют*, в котором нас ждёт множество событий, позитивно влияющих на этот рынок. Наша задача как инвесторов - не упустить новый цикл роста и зайти в первый вагон этого поезда\n' +
            '\n' +
            '• Обычная цена за вход - 15.000р на 3 месяца. Сегодня - БЕСПЛАТНО\n' +
            '• Были приложены титанические усилия, чтобы предоставить вам такой мощный продукт ровно за 0₽ - 🤝\n' +
            '\n' +
            '*Если вы готовы присоединиться - жмите кнопку УЧАСТВОВАТЬ*',

        HOW_TO_JOIN:
            '📍КАК ПОПАСТЬ В НАШ ПРОЕКТ: \n' +
            '\n' +
            '*Вам необходимо зарегистрироваться по ссылке и создать торговый счёт -* REFERRAL_LINK\n' +
            '\n' +
            'Это лучшая на текущий момент биржа, обслуживающая РФ. Работать с криптовалютой советуем только там, чтобы не нарваться на санкции\n' +
            '\n' +
            '_Если у вас уже есть аккаунт на Bybit - нужно создать новый по ссылке выше. Если не знаете, как это сделать, напишите нам -_ @pleasurehelp\n' +
            '\n' +
            '*После регистрации по нашей ссылке нажмите кнопку ГОТОВО*',

        HOW_TO_CHECK_UID:
            '📍Отлично, почти закончили. Осталось только подтвердить регистрацию:\n' +
            '\n' +
            '*• Отправьте боту идентификационный номер вашего аккаунта (UID). Без дополнительных подписей, только цифры*\n' +
            '\n' +
            '[Как узнать свой UID - инструкция](https://telegra.ph/KAK-UZNAT-SVOJ-UID-NA-BIRZHE-BYBIT-01-24)\n' +
            '\n' +
            '_Проверка пройдёт автоматически. После подтверждения регистрации по нашей ссылке бот выдаст Вам доступ в канал проекта, где будут сделки, обучение и дальнейшие инструкции_',

        INVALID_UID:
            'Похоже, вы прислали свой UID, но указали что-то лишнее. Отправьте боту UID без дополнительных подписей и пробелов, только цифры',

        REGISTRATION_FAILED:
            'Регистрация не подтверждена ❌\n' +
            '\n' +
            'В нашем проекте могут участвовать только подтверждённые пользователи\n' +
            '\n' +
            'Пройдите регистрацию на бирже по ссылке ниже и скиньте боту ваш UID для автоматической проверки\n' +
            '\n' +
            '*Ссылка для регистрации* - REFERRAL_LINK\n' +
            '\n' +
            'Если у вас уже есть аккаунт на Bybit - необходимо создать новый по ссылке выше. Если не знаете, как это сделать, напишите нам - @pleasurehelp',

        REGISTRATION_OK:
            'Регистрация подтверждена ✅\n' +
            '\n' +
            'Подавайте заявку в канал, где проходит проект - https://t.me/+oq9NMr6Jjxc1Zjli\n' +
            '\n' +
            '_Заявка будет одобрена в течение 30 минут. Ожидайте_'
    },
    ADMIN_BOT: {
        WELCOME:
            'Данный бот создан для управления рассылкой для Bybit ботов #1 и #2. Для начала работы нажмите кнопку "НАЧАТЬ"',
        INTRO:
            `Для начала работы нажмите "${BUTTONS.ADMIN_BOT.PREPARE_MESSAGES.text}", также в любой момент вы можете нажать "${BUTTONS.ADMIN_BOT.CANCEL.text}" для возврата в начало`,
        SELECT_BOTS:
            'Выберите, какие боты будут отправлять сообщения',
        SELECT_CLIENTS:
            'Выберите, какие клиентам будут отправлены сообщения',
        APPLY_TEXT:
            `Наберите текст (в сообщении может быть не больше 10 фото) и нажмите "${BUTTONS.ADMIN_BOT.APPLY_TEXT.text}"`,
        APPLY_BUTTON_LABEL:
            `Введите название кнопки и нажмите "${BUTTONS.ADMIN_BOT.SAVE_BUTTON_LABEL.text}"`,
        DO_APPLY_BUTTON_LABEL:
            `Нажмите "${BUTTONS.ADMIN_BOT.SAVE_BUTTON_LABEL.text}"`,
        APPLY_BUTTON_URL:
            `Введите url для кнопки (например, https://test.ru/test) и нажмите "${BUTTONS.ADMIN_BOT.SAVE_BUTTON_URL.text}"`,
        DO_APPLY_BUTTON_URL:
            `Нажмите "${BUTTONS.ADMIN_BOT.SAVE_BUTTON_URL.text}"`,
        CHECK_AND_APPLY_TEXT:
            `⚠ Текст пустой, исправьте и нажмите "${BUTTONS.ADMIN_BOT.APPLY_TEXT.text}"`,
        DO_APPLY_TEXT:
            `Нажмите "${BUTTONS.ADMIN_BOT.APPLY_TEXT.text}"`,
        NEED_BUTTON:
            'Выберите, нужна ли кнопка',
        START_SENDING:
            `Для начала рассылки нажмите "${BUTTONS.ADMIN_BOT.START_MESSAGE_SENDING.text}"`,
        MESSAGES_SENT:
            `Рассылка запущена. Для подготовки рассылки нажмите "${BUTTONS.ADMIN_BOT.PREPARE_MESSAGES.text}"`
    }

}