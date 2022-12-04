import { createSelasClient } from "../src/index";

import * as dotenv from 'dotenv'
dotenv.config()

describe("testing index file", () => {


    test("creation of user ", async () => {  

        expect(process.env.TEST_APP_KEY).toBeDefined();

        const selas = await createSelasClient({
            app_id: process.env.TEST_APP_ID!,
            key: process.env.TEST_APP_KEY!,
            secret: process.env.TEST_APP_SECRET!,
        });

        await selas.echo();

        //const result_user = await selas.createAppUser();

        //const v_app_user_id = String(result_user.data);

        //const result_token = await selas.createToken({ app_user_id: v_app_user_id });

        //const v_app_user_token = String(result_token.data);

        //const credit_result_1 = await selas.getAppUserCredits({ app_user_id: v_app_user_id });

        //expect(credit_result_1.data).toBe(0);

        //await selas.addCredit({ app_user_id: v_app_user_id, amount: 10 });

        //const credit_result_2 = await selas.getAppUserCredits({ app_user_id: v_app_user_id });

        //expect(credit_result_2.data).toBe(10);

        // console.log(await selas.postJob({
        //     service_id: '04cdf9c4-5338-4e32-9e63-e15b2150d7f9',
        //     job_config: '{"steps":28,"width":512,"eight":512,"prompt":"cute cat","sampler":"k_lms","translate":false,"batch_size":1,"skip_steps":0,"nsfw_filter":false,"image_format":"png","guidance_scale":7.5}',
        // }));



        //const result_deactivation = await selas.deactivateAppUser({ app_user_id: v_app_user_id });

        //expect(result_deactivation.data).toBe(true);

    });
});