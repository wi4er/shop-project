import Bun from "bun";
import {createRequire} from 'module';
import Init, {Bot} from "./init";

const require = createRequire(import.meta.url);

const router = new Bun.FileSystemRouter({
    style: "nextjs",
    dir: "./routes",
});

const commands = new Bun.FileSystemRouter({
    style: "nextjs",
    dir: "./commands",
});

(async () => {
    for await(const update of Init()) {
        console.dir(update, {depth: 10});

        if (update?.message?.contact) {
            require("./commands/contact").default(update.message, Bot);

            continue;
        }

        if (!update?.message?.text)  continue;

        const com = commands.match(update.message.text);

        if (com) {
            await require(com.filePath).default(update.message, Bot);
        }
    }
})();

Bun.serve({
    port: 3030,
    fetch(request: Request) {
        return require(router.match(request).filePath).default(request);
    },
});

