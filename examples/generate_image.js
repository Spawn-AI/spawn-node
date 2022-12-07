const selas = require("../dist/index.cjs");

const generateImage = async () => {
  const client = await selas.createSelasClient(
    {
      app_id: "2cef0cb9-35da-4d0b-b3b9-ed51caa67bab",
      key: "Xn*ga&SZ&+wqcfsd",
      secret: "*ekEFYPke()@-Ljm",
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
    prompt: "a cute calico cat artstation",
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
