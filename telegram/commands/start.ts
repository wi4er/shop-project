export default async (message, Bot) => {
    const res = await Bot.api("sendMessage", {
        chat_id: message.chat.id,
        reply_to_message_id: message.message_id,
        text: 'Please share your phone number for continue.',
        reply_markup: {
            one_time_keyboard: true,
            resize_keyboard: true,
            keyboard: [
                [
                    {
                        text: 'Share phone number',
                        request_contact: true,
                    },
                ],
            ],
        },
    });

    // console.dir(res, { depth: 10 })

    // const res = await Bot.api("sendMessage", {
    //     chat_id: message.chat.id,
    //     reply_to_message_id: message.message_id,
    //     text: 'Please share your phone number for continue.',
    //     reply_markup: {
    //         inline_keyboard: [
    //             [
    //                 {
    //                     text: 'Поделиться номером телефона',
    //                     callback_data: 'button_clicked',
    //                 },
    //             ],
    //         ],
    //     },
    // });

}
