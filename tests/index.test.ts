import {
  createSpawnClient,
  SpawnClient
} from "../src/index";

import * as dotenv from "dotenv";

dotenv.config();

describe("testing spawn-node", () => {
  let spawn: SpawnClient;
  let user = "Skippy Jack";
  let job: string;

  test("creation of client", async () => {
    spawn = await createSpawnClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      },
      {
        branch: "fix-the-add-on-downloading-paw-47"
      }
    );

    expect(spawn).toBeDefined();

    const data = await spawn.echo("Hello");
    expect(data).toEqual("Hello");
  });

  test("creation of users", async () => {
    spawn = await createSpawnClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      }
    );

    const data = await spawn.createAppUser("Pierre Binouze");
    expect(data).toBeDefined();

    let credit = await spawn.setCredit(user,100);
    expect(credit).toEqual(100);
  });

  test("token's life cycle", async () => {
    const new_token = await spawn.createToken(user);

    expect(new_token).toBeDefined();

    const token = await spawn.getAppUserToken(user);

    expect(token).toEqual(new_token);

    const deleted = await spawn.deleteAllTokenOfAppUser(user);

    expect(deleted).toEqual(true);
  });

  test("get service list", async () => {
    spawn = await createSpawnClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      }
    );
    const data = await spawn.getServiceList();
    expect(data).toBeDefined();
  });

  test("get add on list", async () => {
    spawn = await createSpawnClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      }
    );
    const data = spawn.getAddOnList();
    console.log(data);
    expect(data).toBeDefined();
  });

  test("creation of job", async () => {
    spawn = await createSpawnClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
        app_user_external_id: "Skippy Jack"
      }
    );

    const data = await spawn.runStableDiffusion("banana in a kitchen")

    job = String(data);
    expect(job).toBeDefined();
  });

  test("Get a app user's job history", async () => {
    spawn = await createSpawnClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      }
    );
    const data = await spawn.getAppUserJobHistory("hello",10, 0);
    expect(data).toBeDefined();
  });

  test("get the number of worker for this filter", async () => {
    spawn = await createSpawnClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      }
    );
    const data = await spawn.getCountActiveWorker();
    expect(data).toBeDefined();
  });

  test("Test the post of patch", async () => {
    spawn = await createSpawnClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      }
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
    const data = await spawn.runPatchTrainer(dataset, "f-crampoute10");
    expect(data).toBeDefined();
  });

  test("getResult", async () => {
    spawn = await createSpawnClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      }
    );
    const data = await spawn.getResult("c97ac10a-f647-4ab7-a531-9a8708df1c8d");
    expect(data).toBeDefined();
  });

  test("Share an add on", async () => {
    spawn = await createSpawnClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      }
    );
    const data = await spawn.shareAddOn("f-deca","Jacques");
    expect(data).toBeDefined();
  });

  test("Delete an add on", async () => {
    spawn = await createSpawnClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      }
    );
    const data = await spawn.deleteAddOn("f-crampoute");
    expect(data).toBeDefined();
  });

  test("Rename an add on", async () => {
    spawn = await createSpawnClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      }
    );
    const data = await spawn.renameAddOn("f-crampoute2","f-beepboop");
    expect(data).toBeDefined();
  });

  test("Publish an add on", async () => {
    spawn = await createSpawnClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      }
    );
    const data = await spawn.publishAddOn("f-crampoute8");
    expect(data).toBeDefined();
  });

  test("Unpublish an add on", async () => {
    spawn = await createSpawnClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      }
    );
    const data = await spawn.unpublishAddOn("f-crampoute8");
    expect(data).toBeDefined();
  });


});
