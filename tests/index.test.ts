import { createSelasClient, SelasClient, StableDiffusionConfig, PatchConfig } from "../src/index";

import * as dotenv from "dotenv";

dotenv.config();

describe("testing selas-node", () => {
  let selas: SelasClient;
  let user = "Skippy Jack";
  let job: string;

  test("creation of client", async () => {
    selas = await createSelasClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      },
      { branch: "main" }
    );

    expect(selas).toBeDefined();

    const data = await selas.echo({ message: "Hello"});
    expect(data).toEqual("Hello");
  });

  test("creation of users", async () => {
    selas = await createSelasClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      },
      { branch: "main" }
    );

    const data = await selas.createAppUser({external_id: "Jacques Binouze"});
    expect(data).toBeDefined();
    
    let credit = await selas.setCredit({ app_user_external_id: user, amount: 100 });
    expect(credit).toEqual(100);
  });

  test("token's life cycle", async () => {
    const new_token = await selas.createToken({ app_user_external_id: user });
    
    expect (new_token).toBeDefined();

    const token = await selas.getAppUserToken({ app_user_external_id: user });

    expect(token).toEqual(new_token);

    const deleted = await selas.deleteAllTokenOfAppUser({ app_user_external_id: user });

    expect(deleted).toEqual(true);
    
  });

  test("get service list", async () => {
    selas = await createSelasClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      },
      { branch: "main" }
    );
    const data = await selas.getServiceList();
    expect(data).toBeDefined();
  });

  test("get add on list", async () => {
    selas = await createSelasClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      },
      { branch: "main" }
    );
    const data = await selas.getAddOnList();
    console.log(data);
    expect(data).toBeDefined();
  });

  test("creation of job", async () => {
    selas = await createSelasClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      },
      { branch: "main" }
    );

    const data = await selas.runStableDiffusion("banana in a kitchen",
      {patches: [PatchConfig("patch-test")]});


    job = String(data);
    expect(job).toBeDefined();
    
  });

  test("Get a app user's job history", async () => {
    selas = await createSelasClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      },
      { branch: "main" }
    );
    const data = await selas.getAppUserJobHistory({ app_user_external_id: user, p_limit : 10, p_offset : 0, });
    expect(data).toBeDefined();
  });

  test("Get a config's cost for a job", async () => {
    selas = await createSelasClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      },
      { branch: "main" }
    );

    const config: StableDiffusionConfig = {
      steps: 28,
      skip_steps: 0,
      batch_size: 1,
      sampler: "k_euler",
      guidance_scale: 10,
      width: 512,
      height: 512,
      prompt: "banana in the kitchen",
      negative_prompt: "ugly",
      image_format: "jpeg",
      translate_prompt: false,
      nsfw_filter: false
    };

    const data = await selas.getServiceConfigCost({ service_name: "stable-diffusion-1-5", job_config: config});
    expect(data).toBeDefined();
  });

  test("get the number of worker for this filter", async () => {
    selas = await createSelasClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      },
      { branch: "main" }
    );
    const data = await selas.getCountActiveWorker();
    expect(data).toBeDefined();
  });
});
