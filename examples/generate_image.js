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

  const response = await client.runStableDiffusion({
    prompt: "A comic potrait of a cyberpunk cyborg girl with big and cute eyes, fine - face, realistic shaded perfect face, fine details. night setting. very anime style. realistic shaded lighting poster by ilya kuvshinov katsuhiro, magali villeneuve, artgerm, jeremy lipkin and michael garmash",
    negative_prompt: "istock, shutterstock, getty, alamy, dreamstime, yayphoto high contrast, (weird eyes:1.3), logo, watermark, photograph, blurry, grainy, duplicate eyes",
    steps: 50,
    skip_steps: 0,
    batch_size: 1,
    sampler: "dpm_multistep",
    guidance_scale: 7,
    width: 512,
    height: 640,
    image_format: "jpeg",
    translate_prompt: false,
    nsfw_filter: false
  }, model_name="stable-diffusion-2-1-base");

  if (response.data) {
    client.subscribeToJob({
      job_id: response.data['job_id'],  
      callback: function (data) {
        console.log(data);
      },
    });
  } else {
    console.log(response.error);
  }
};

generateImage();
