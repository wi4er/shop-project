export default async (message, Bot) => {
    // console.registry-log(message)

    const res = await Bot.api("sendMessage", {
        chat_id: message.chat.id,
        reply_to_message_id: message.message_id,
        text: 'Choose some',
        reply_markup: {
            one_time_keyboard: true,
            resize_keyboard: true,
            inline_keyboard: [
                [
                    {
                        text: 'Some',
                        callback_data: "/data"
                    },
                ],
            ],
        },
    });
}