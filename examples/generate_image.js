const selas = require("../dist/index.cjs");

const generateImage = async () => {
  const client = await selas.createSelasClient(
    {
      app_id: "abe6dc68-ee80-418c-9e60-6b03f30f541c",
      key: "4UR5M(pPDrsAE$o-",
      secret: "SFF9WKLN3PmXT=43",
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
    prompt: "banana in the kitchen",
    negative_prompt: "(weird: 0.15)",
    image_format: "jpeg",
    translate_prompt: false,
    nsfw_filter: false,
    seed: 1
  };

  const response = await client.runStableDiffusion(config);

  if (response.data) {
    client.subscribeToJob({job_id: response.data, callback: function (data) { console.log(data); }});
  } else {
    console.log("helol");
  }
};

generateImage();
