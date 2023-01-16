const selas = require("../dist/index.cjs");
require("dotenv").config();

const generateImage = async () => {
  const client = await selas.createSelasClient({
    app_id: process.env.TEST_APP_ID,
    key: process.env.TEST_APP_KEY,
    secret: process.env.TEST_APP_SECRET,
  });


  console.log(await client.getCountActiveWorker());
  console.log(await client.isUser("Bertrand"));

  console.log(await client.costStableDiffusion("warrior"))

  const response = await client.runStableDiffusion("ironman in a banana armor", {
    patches: [
      {
        name: 'Skippy Jack/f-boopboop',
        alpha_text_encoder: 0.5,
        alpha_unet: 0.5,
        steps: 1000,
      },
    ],
  });


  console.log(response);

  if (response) {
    await client.subscribeToJob(response['job_id'],function (data) {console.log(data);});
  } else {
    console.log(response.error);
  }
};

generateImage();
