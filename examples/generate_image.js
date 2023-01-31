const selas = require("../dist/index.cjs");
require("dotenv").config();

const generateImage = async () => {
  const client = await selas.createSelasClient({
    app_id: process.env.TEST_APP_ID,
    key: process.env.TEST_APP_KEY,
    secret: process.env.TEST_APP_SECRET,
    }
  );

  function fn(response) {
    if ("result" in response) {
      console.log(response.result[0].url);
    }
  }

  await client.runStableDiffusion("ironman in a banana armor", {batch_size:4, "callback" : fn});


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
  const response = await client.runPatchTrainer(dataset, "f-crampoute17");



};

generateImage();
