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

```js
const data = await selas.createAppUser("Jacques Binouze");
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

