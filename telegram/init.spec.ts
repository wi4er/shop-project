import Init from "./init";
import { describe, expect, test } from "bun:test";


describe('Init telegram', () => {
    test('Should init', async () => {
        await Init();
    });
});