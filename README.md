# Selas Node

A Node.js implementation of the Selas protocol.

## Overview

The Selas Node module is a Node.js implementation of the Selas protocol. It allows you to run jobs on the Selas platform from your Node.js code. The Selas Node module is available on [npm](https://www.npmjs.com/package/@selas/selas-node). You can find the source code for the Selas Node module on [GitHub](https://github.com/SelasAI/selas-node). The Selas Node module is licensed under the [MIT License](https://opensource.org/licenses/MIT). The Selas Node module is currently in beta, so please report any bugs or issues you encounter.

## Installation

To install the Selas Node module, you can run the following command in your terminal:
```bash
npm install @selas/selas-node
```

## Usage

To use the Selas Node module, you need to require it in your JavaScript code and create a Selas client object. To get started, you need to create a Selas account and create an app. You can find more information about creating a Selas account and creating an app in the [Selas documentation](https://selas.ai/docs/). Once you have created an app, you can get the app_id, key, and secret from the app settings page. You can then use these values to create a Selas client object:


```js
const Selas = require('@selas/selas-node');


const client = await selas.createSelasClient(
{
    app_id: process.env.TEST_APP_ID,
    key: process.env.TEST_APP_KEY,
    secret: process.env.TEST_APP_SECRET,
}
);
```

### Administration of the users

#### Authorizing or denying the access to the services

Using the Selas-node client, you can manage how your customers can access our services. 

To allow a user to access our services, you first need to create an app user. During the creation, you need to provide an identifier that will be necessary to access to the usage data. It will be refered in this client as an external id. This external id can be an email, a username, a phone number, a crypto wallet address, etc. 

```js
const selas_id = await selas.createAppUser("Benoit");
```

Once a user is created, you can allow or deny the usage of paid services for this user. This is done by handling the tokens of the user. You can create a token for a user by providing the external id of the user.


```js
let new_token = await selas.createToken("theWizard@selas.com");
```

There is no need to store the token in your database. You can retrieve it at any time by providing the external id of the user.

```js
let token = await selas.getAppUserToken("Serge");
```

There is no need to give a token for every utilisation. Once a token is created, it remain active until it is deleted. If you need to deny the access to a user, you can delete all the tokens of the user.

```js
const is_token_deleted = await selas.deleteAllTokenOfAppUser("theWizard@selas.com");
```

Moreover, the AI usage of a user is limited by the amount of credit that you give it. You can set the credit of a user by providing the external id of the user and the amount of credit you want to give. This security is mandatory to avoid a user to use all the credit of your app.

```js
let credit = await selas.setCredit(user,100);
```

#### Accessing user usage

As the administror of your application, you can access all the informations that we have on your users.

You can get the credit of a user by providing the external id of the user.
```js
const credit = await getAppUserCredits(user);
```

You can get the history of all the jobs that a user has run on our service.
```js
const history = await selas.getAppUserJobHistory(user,10, 0);
```

If you want to get the specific result of a job (be it an image or an add-on), you can user the getResult method. You need to provide the job_id of the job you want to get the result of. It will return a json object with the result of the job.
```js
const image = await selas.getResult(job_id);
```

As your user will be able to create add-ons, you will have a complete right to access them. All add-ons create by your customers and by you will be accessible by the getAddOnList method. It will return a json object with all the add-ons of your app.
```js
const add_ons = this.getAddOnList();
```

Moreover, you can delete, share or rename any add-on created on your application.
```js
const is_renamed = await selas.renameAddOn('User1/landscape add-on', 'forest add-on');

const is_shared = await selas.shareAddOn('User1/forest add-on', 'Benoit');

const is_deleted = await selas.deleteAddOn('User1/forest add-on');
```


### Usage of IA services

Even if this the Selas-node client is created to manage applications and its users, it has all the needed methods for running jobs on the Selas platform. When running jobs on Selas-node, you are seen as a super-user and do not have to use tokens or credit.

To know how many workers are active on the Selas platform, you can use the getCountActiveWorker method. It will return the number of workers for each service.
```js
let workers = await client.getCountActiveWorker();
```

#### Running an image generation job

The following example shows how to run a stable diffusion job with minimal parameters.

```js
const response = await client.runStableDiffusion("a cute cat");
```

To get the cost of a job without running it, you can use the costStableDiffusion method. Its syntax is exactly the same as runStableDiffusion.

```js
const cost = await client.costStableDiffusion("a cute cat");
```

```js

It is possible to specify additional parameters for the jobs. Those parameters are defined in this list :
```js
/**
  * @param prompt - the description of the image to be generated
  * @param args.negative_prompt - description of the image to be generated, but with negative words like "ugly", "blurry" or "low quality"
  * @param args.width - the width of the generated image
  * @param args.height - the height of the generated image
  * @param args.steps - the number of steps of the StableDiffusion algorithm. The higher the number, the more detailed the image will be. Generally, 30 steps is enough, but you can try more if you want.
  * @param args.batch_size - the number of images to be generated at each step.
  * @param args.guidance_scale - the weight of the guidance image in the loss function. Typical values are between 5. and 15. The higher the number, the more the image will look like the prompt. If you go too high, the image will look like the prompt but will be low quality.
  * @param args.init_image - the url of an initial image to be used by the algorithm. If not provided, random noise will be used. You can start from an existing image and make StableDiffusion refine it. You can specify the skip_steps to choose how much of the image will be refined (0 is like a random initialization, 1. is like a copy of the image).
  * @param args.mask - the url of a mask image. The mask image must be a black and white image where white pixels are the pixels that will be modified by the algorithm. Black pixels will be kept as they are. If not provided, the whole image will be modified.
  * @param args.skip_steps - the number of steps to skip at the beginning of the algorithm. If you provide an init_image, you can choose how much of the image will be refined. 0 is like a random initialization, 1. is like a copy of the image.
  * @param args.seed - the seed of the random number generator. Using twice the same we generate the same image. It can be useful to see the effect of parameters on the image generated. If not provided, a random seed will be used.
  * @param args.image_format - the format of the generated image. It can be "png" or "jpeg".
  * @param args.nsfw_filter - if true, the image will be filtered to remove NSFW content. It can be useful if you want to generate images for a public website.
  * @param args.translate_prompt - if true, the prompt will be translated to English before being used by the algorithm. It can be useful if you want to generate images in a language that is not English.
  */
```

To specify those parameters, you can use the runStableDiffusion method and pass in an object with the parameters you want to change as arguments.

```js
const response = await client.runStableDiffusion("a cute cat",{width: 640, height: 384, image_format: "jpeg"});
```

More specific at our plateform, you can alter your jobs by using one or multiple add-ons that are have been trained or shared to your application.
```js
const response = await client.runStableDiffusion("a cute cat",{patches: [
      {
        name: 'Serge/chinese_landscape',
        alpha_text_encoder: 0.5,
        alpha_unet: 0.5,
        steps: 1000,
      },
    ],});
```

The response object will contain the job_id of the job that was created. You can use this job_id to check the status of the job and to retrieve the results of the job. This result can take a few second to be produced.

```js
const result = await client.getResult(response['job_id']);
```

You can also subscribe to the job by calling the subscribeToJob method on the Selas client object and passing in an object with the job_id and a callback function as arguments. The callback function will be called whenever new data is available for the job:

```js
const response = await client.runStableDiffusion("a cute cat");

if (response) {
    await client.subscribeToJob(
      response['job_id'],
      function (data) {console.log(data);}
    );
} else {
    console.log(response.error);
}
```

#### Running a patch creation job

The following example shows how to run a patch creation job with minimal parameters.

```js
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
    const data = await selas.runPatchTrainer(dataset, "f-compo style");
    expect(data).toBeDefined();
```

To get the cost of a job without posting it, you can use the costPatchTrainer method. Its syntax is the same as the runPatchTrainer method.

```js
const data = await selas.costPatchTrainer(dataset, "f-compo style");
```

To train a patch, you need a list of images and label that will be used to train the patch. They will alter the stable diffusion model to generate images that are similar to the images you provide. The label is used to describe the images you provide. It can be a sentence or a list of words.

## Documentation

For more information about the Selas Node module, please refer to the [Selas Node documentation](https://selas.ai/docs/selas-node).

