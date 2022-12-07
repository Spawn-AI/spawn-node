const selas = require("../dist/index.cjs");
require('dotenv').config()

const generateImage = async () => {
  const client = await selas.createSelasClient(
    {
      app_id: process.env.TEST_APP_ID,
      key: process.env.TEST_APP_KEY,
      secret: process.env.TEST_APP_SECRET,
    },
    { branch: "main" }
  );

  const config = {
    steps: 28,
    skip_steps: 0,
    batch_size: 1,
    sampler: "k_euler",
    guidance_scale: 10,
    width: 512,
    height: 512,
    prompt: "hand gel on someone",
    negative_prompt: "(weird: 0.15) (blur: 0.15) ugly vintage text (gray background: 0.15) (dog: 0.6)",
    image_format: "jpeg",
    translate_prompt: false,
    nsfw_filter: false,
    seed: 1
  };

  const response = await client.runStableDiffusion(config);

  if (response.data) {
    client.subscribeToJob({job_id: response.data, callback: function (data) { console.log(data); }});
  } else {
    console.log(response.error);
  }
};

generateImage();
