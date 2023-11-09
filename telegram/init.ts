import BotFather from "botfather";

const inst = new BotFather("6975896609:AAEI30FfAIhlHpit20BB-sjmi8NWhc-QqgY");
const parameters = {limit: 100, timeout: 60 * 2, offset: 0};

async function* Init() {
    while (true) {
        const updates = await inst.api('getUpdates', parameters)
            .then(json => {
                if (json.ok) return json.result;
            });

        // console?.log?.("********************************************************************************************");

        for (let update of updates) yield update;

        if (updates.length > 0) {
            const identifiers = updates.map((update) => update.update_id);
            parameters.offset = Math.max(...identifiers) + 1;
        }
    }
}

export default Init;
export const Bot = inst;