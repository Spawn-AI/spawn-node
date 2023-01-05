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
const add_ons = await this.getAddOnList();
```

### Usage of IA services

The Selas client object has methods for running jobs on the Selas platform. The following example shows how to run a stable diffusion job:

```js
const response = await client.runStableDiffusion("a cute cat");
```

The response object will contain the job_id of the job that was created. You can use this job_id to check the status of the job and to retrieve the results of the job.

```js
const status = await client.getJobStatus(response['job_id']);
```

You can also subscribe to the job by calling the subscribeToJob method on the Selas client object and passing in an object with the job_id and a callback function as arguments. The callback function will be called whenever new data is available for the job:

```js
const response = await client.runStableDiffusion("a cute cat");

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
```

## Documentation

For more information about the Selas Node module, please refer to the [Selas Node documentation](https://selas.ai/docs/selas-node).

