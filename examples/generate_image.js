const selas = require("../dist/index.cjs");
require("dotenv").config();

const generateImage = async () => {
  const client = await selas.createSelasClient(
    {
      app_id: process.env.TEST_APP_ID,
      key: process.env.TEST_APP_KEY,
      secret: process.env.TEST_APP_SECRET,
    },
    { branch: "main" }
  );

  const response = await client.runStableDiffusion("a cute cake");

  if (response) {
    await client.subscribeToJob({
      job_id: response['job_id'],  
      callback: function (data) {
        console.log(data);
      },
    });
  } else {
    console.log(response.error);
  }
};

generateImage();
