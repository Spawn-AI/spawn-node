import { createSelasClient, SelasClient, StableDiffusionConfig} from "../src/index";

import * as dotenv from 'dotenv'

dotenv.config()

describe("testing selas-node", () => {

    let selas: SelasClient;
    let user: string;

    test("creation of client", async () => {
        selas = await createSelasClient({
            app_id: process.env.TEST_APP_ID!,
            key: process.env.TEST_APP_KEY!,
            secret: process.env.TEST_APP_SECRET!,
        });

        expect(selas).toBeDefined();

        const { data, error } = await selas.echo();
        expect(error).toBeNull();
        expect(data).toEqual("echo");


    });

    test("creation of users", async () => {
        const { data, error } = await selas.createAppUser();
        expect(error).toBeNull();
        if (!error){
            user = data;
            expect(user).toBeDefined();
        }
    });

    test("token's life cycle", async () => {
        let new_token = await selas.createToken({ app_user_id: user });
        expect(new_token.error).toBeNull();
        if (!new_token.error){
            let token = await selas.getAppUserToken({ app_user_id: user })
            if (!token.error){
                expect(token.data).toEqual(new_token.data);
            }
        }
        let deleted = await selas.deactivateAppUser({ app_user_id: user });
        expect(deleted.error).toBeNull();
        if (!deleted.error){
            expect(deleted.data).toEqual(true);
        }
    });

    test("creation of job", async () => {
        const config: StableDiffusionConfig = {
            steps: 5,
            skip_steps: 0,
            batch_size: 1,
            sampler: "plms",
            guidance_scale: 0.5,
            width: 384,
            height: 384,
            prompt: "banana in the kitchen",
            negative_prompt: "ulgy",
            image_format: "png",
            translate_prompt: false,
            nsfw_filter: true
        };
        const { data, error } = await selas.postJob({
            service_id: '04cdf9c4-5338-4e32-9e63-e15b2150d7f9',
            job_config: JSON.stringify(config)
        });
        expect(error).toBeNull();
        if (!error){
            expect(data).toBeDefined();
        }
    });

});