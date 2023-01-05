const selas = require("../dist/index.cjs");
require("dotenv").config();

const generateImage = async () => {
  const client = await selas.createSelasClient({
    app_id: process.env.TEST_APP_ID,
    key: process.env.TEST_APP_KEY,
    secret: process.env.TEST_APP_SECRET,
  });

  console.log(await client.getCountActiveWorker());

  const response = await client.runStableDiffusion("A person in front a car", {
    patches: [
      {
        name: "patch-testou",
        alpha_text_encoder: 0.5,
        alpha_unet: 0.5,
        steps: 1000,
      },
    ],
  });
  console.log(response);

  if (response) {
    await client.subscribeToJob({
      job_id: response["job_id"],
      callback: function (data) {
        console.log(data);
      },
    });
  } else {
    console.log(response.error);
  }
};

generateImage();
