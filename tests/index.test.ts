import {
  createSelasClient,
  SelasClient,
  StableDiffusionConfig
} from "../src/index";

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

    const data = await selas.echo("Hello");
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

    const data = await selas.createAppUser("Pierre Binouze");
    expect(data).toBeDefined();

    let credit = await selas.setCredit(user,100);
    expect(credit).toEqual(100);
  });

  test("token's life cycle", async () => {
    const new_token = await selas.createToken(user);

    expect(new_token).toBeDefined();

    const token = await selas.getAppUserToken(user);

    expect(token).toEqual(new_token);

    const deleted = await selas.deleteAllTokenOfAppUser(user);

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

    const data = await selas.runStableDiffusion("banana in a kitchen");

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
    const data = await selas.getAppUserJobHistory(user,10, 0);
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
      nsfw_filter: false,
    };

    const data = await selas.getServiceConfigCost("stable-diffusion-1-5",config);
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

  test("Test the post of patch", async () => {
    selas = await createSelasClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      },
      { branch: "main" }
    );
    let dataset = [
      {
        url: "https://img.sanctuary.fr/fiche/origin/78.jpg",
        label: "fcompo style, a group of people standing next to each other, by Otomo Katsuhiro, french comic style, zenescope, complex emotion, cover corp"
      },
      {
        url: "https://ramenparados.com/wp-content/uploads/2020/10/Family-Compo-destacado.jpg",
        label: "fcompo style, a couple sitting on top of a red fire hydrant, a manga drawing, by Yumihiko Amano, shin hanga, city hunter, beautiful anime girl squatting, katsuhiro otomo and junji ito, realistic manga"
      },
      {
        url: "https://www.manga-news.com/public/images/pix/serie/4219/family-compo-visual-4.jpg",
        label:
          "fcompo style, a drawing of a woman bending over on a skateboard, a manga drawing, by Fujishima Takeji, pixiv, shin hanga, wearing a tank top and shorts, early 90s cg, ( ultra realistic ), portrait of mayuri shiina",
      },
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBexZRrbQC-wMlw3Y04K9KKPH_Mu0yX5sjrzHjybroJNtYEz-aVusWrPHAMJF1svM71QQ&usqp=CAU",
        label:
          "fcompo style, a drawing of a woman holding a baseball bat, inspired by Kusumi Morikage, pixiv, shin hanga, fully clothed. painting of sexy, あかさたなは on twitter, pin on anime, initial d",
      },
    ];
    const data = await selas.runPatchTrainer(dataset, "f-crampoute6");
    expect(data).toBeDefined();
  });

  test("getResult", async () => {
    selas = await createSelasClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      },
      { branch: "main" }
    );
    const data = await selas.getResult("c97ac10a-f647-4ab7-a531-9a8708df1c8d");
    expect(data).toBeDefined();
  });

  test("Share an add on", async () => {
    selas = await createSelasClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      },
      { branch: "main" }
    );
    const data = await selas.shareAddOn("f-deca","Jacques");
    expect(data).toBeDefined();
  });

  test("Delete an add on", async () => {
    selas = await createSelasClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      },
      { branch: "main" }
    );
    const data = await selas.deleteAddOn("f-crampoute");
    expect(data).toBeDefined();
  });

  test("Rename an add on", async () => {
    selas = await createSelasClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      },
      { branch: "main" }
    );
    const data = await selas.renameAddOn("Skippy Jack/f-boop","f-boopboop");
    expect(data).toBeDefined();
  });


});
