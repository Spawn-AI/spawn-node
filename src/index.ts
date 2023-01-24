//TODO documentation site web

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// @ts-ignore
import Pusher from "pusher-client";

/**
 * WorkerFilter is a filter to select workers.
 * @param id - ID of the worker (optional).
 * @param name - Name of the worker (optional).
 * @param branch - Branch of the worker (optional).
 * @param is_dirty - Whether the worker is dirty (optional).
 * @param cluster - Cluster of the worker (optional).
 */
export type WorkerFilter = {
  id?: string;
  name?: string;
  branch?: string;
  is_dirty?: boolean;
  cluster?: number;
};

/**
 * TrainingImage contains the informations necessary for the training of a patch.
 * @param url - URL of the image.
 * @param label - Label of the image. The label is a description of the image.
 */
export type TrainingImage = {
  url: string;
  label: string;
};

/**
 * PatchConfig is the configuration for a patch.
 * @param name - Name of the patch.
 * @param alpha_text_encoder - Weight of the alteration of the patch on Stable Diffusion's text encoder
 * @param alpha_unet - Weight of the alteration of the patch on Stable Diffusion's UNet
 * @param steps - Number of steps to train the patch.
 */
export type PatchConfig = {
  name: string;
  alpha_text_encoder: number;
  alpha_unet: number;
  steps: number;
};

/**
 * StableDiffusionConfig is the configuration for the stable diffusion job.
 * @param steps - Number of steps to run the job for.
 * @param skip_steps - Number of steps to skip before starting the job.
 * @param batch_size - Batch size to use for the job.
 * @param sampler - Sampler to use for the job.
 * @param guidance_scale - Guidance scale to use for the job.
 * @param width - Width of the output image.
 * @param height - Height of the output image.
 * @param prompt - Prompt to use for the job.
 * @param negative_prompt - Negative prompt to use for the job.
 * @param init_image - Initial image to use for the job (optional).
 * @param mask - Mask to use for the job (optional).
 * @param image_format - Image format to use for the job.
 * @param translate_prompt - Whether to translate the prompt.
 * @param nsfw_filter - Whether to filter nsfw images.
 * @param seed - Seed to use for the job (optional).
 * @example -
 *    const config: StableDiffusionConfig = {
 *    steps: 28,
 *    skip_steps: 0,
 *    batch_size: 1,
 *    sampler: "k_euler",
 *    guidance_scale: 10,
 *    width: 512,
 *    height: 512,
 *    prompt: "banana in the kitchen",
 *    negative_prompt: "ugly",
 *    image_format: "jpeg",
 *    translate_prompt: false,
 *    nsfw_filter: false,
 *  };
 */
export type StableDiffusionConfig = {
  steps: number;
  skip_steps: number;
  batch_size: 1 | 2 | 4 | 8 | 16;
  sampler:
    | "plms"
    | "ddim"
    | "k_lms"
    | "k_euler"
    | "k_euler_a"
    | "dpm_multistep";
  guidance_scale: number;
  width: 384 | 448 | 512 | 575 | 768 | 640 | 704 | 768;
  height: 384 | 448 | 512 | 575 | 768 | 640 | 704 | 768;
  prompt: string;
  negative_prompt: string;
  init_image?: string;
  mask?: string;
  image_format: "png" | "jpeg" | "avif" | "webp";
  translate_prompt: boolean;
  nsfw_filter: boolean;
  seed?: number;
  add_ons?: any[];
};

/**
 * PatchTrainerConfig is the configuration for the patch trainer job.
 * @param dataset - Dataset to use for the job.
 * @param patch_name - Name of the patch to train.
 * @param description - Description of the patch to train.
 * @param learning_rate - Learning rate to use for the training.
 * @param steps - Number of steps for the training of the patch.
 * @param rank - Size of the patch to train.
 */
export type PatchTrainerConfig = {
  dataset: any[];
  patch_name: string;
  description: string;
  learning_rate: number;
  steps: number;
  rank: number;
};

/**
 * SelasClient is a client for the Selas API.
 *
 * @param supabase - Supabase client
 * @param app_id - The application ID.
 * @param key - The application key.
 * @param secret - The application secret.
 * @param worker_filter - Filter with regex to select workers.
 */
export class SelasClient {
  supabase: SupabaseClient;
  app_id: string;
  key: string;
  secret: string;
  worker_filter: WorkerFilter;
  services: any[];
  add_ons: any[];

  app_user_id: string;
  app_user_token: string;

  /**
   * constructor creates a new SelasClient.
   * @param supabase
   * @param app_id
   * @param key
   * @param secret
   * @param worker_filter
   * @example
   *  client = await createSelasClient(
   *  {
   *    app_id: process.env.TEST_APP_ID!,
   *    key: process.env.TEST_APP_KEY!,
   *    secret: process.env.TEST_APP_SECRET!,
   *  },
   *  { branch: "main" }
   *);
   */
  constructor(
    supabase: SupabaseClient,
    app_id: string,
    key: string,
    secret: string,
    worker_filter?: WorkerFilter
  ) {
    this.supabase = supabase;
    this.app_id = app_id;
    this.key = key;
    this.secret = secret;
    this.worker_filter = worker_filter || { branch: "prod" };

    this.services = [];
    this.add_ons = [];

    this.app_user_id = "";
    this.app_user_token = "";
  }

  /**
   * handle_error is a function to handle the errors returned by the Selas API.
   * @param error - The error to handle.
   * @example
   * try {
   *   await selas.owner_rpc("test", {});
   * } catch (error) {
   *  this.handle_error(error);
   * }
   * @throws a typescript error
   * @returns nothing
   * @private
   */
  private handle_error = (error: any) => {
    if (error.code === "") {
      throw new Error(
        "The database cannot be reached. Contact the administrator."
      );
    }
    if (error.message === "Invalid API key") {
      throw new Error("The API key is invalid. Contact the administrator.");
    }
    if (error.code === "22P02") {
      throw new Error("The credentials are not correct.");
    }
    if (error.code === "P0001") {
      throw new Error(error.message);
    }
    if (error.code === "23505") {
      throw new Error("This object already exists.");
    } else
      throw new Error(
        "An unexpected error occured. Contact the administrator. " +
          error.message
      );
  };

  /**
   * owner_rpc is a wrapper around the supabase owner_rpc function usable by the SelasClient.
   * @param fn - The name of the function to call.
   * @param params - The parameters to pass to the function.
   * @returns the result of the owner_rpc call.
   * @example
   * const { data, error } = await this.owner_rpc("app_owner_echo", {message_app_owner: "hello"});
   */
  private owner_rpc = async (fn: string, params: any) => {
    const paramsWithSecret = {
      ...params,
      p_secret: this.secret,
      p_app_id: this.app_id,
      p_key: this.key,
    };
    const { data, error } = await this.supabase.rpc(fn, paramsWithSecret);

    return { data, error };
  };

  /**
   * rpc is a wrapper around the supabase rpc function usable by the SelasClient.
   * @param fn - The name of the function to call.
   * @param params - The parameters to pass to the function.
   * @returns the result of the rpc call.
   * @example
   * const { data, error } = await this.rpc("app_user_echo", {message_app_owner: "hello"});
   */
  private user_rpc = async (fn: string, params: any) => {
    const paramsWithToken = {
      ...params,
      p_app_id: this.app_id,
      p_key: this.key,
      p_app_user_id: this.app_user_id,
      p_app_user_token: this.app_user_token,
    };
    const { data, error } = await this.supabase.rpc(fn, paramsWithToken);

    return { data, error };
  };

  /**
   * setUserID fetch the app_user_id from the database, given by the app_user_external_id and the app_user_token set in the constructor.
   * @returns nothing
   * @example
   * await this.setUserID();
   */
    setUserID = async (app_user_external_id: string) => {
      const { data, error } = await this.owner_rpc("app_owner_get_user_id", {p_app_user_external_id: app_user_external_id});
      if (error) {
        throw new Error(error.message);
      }
      if (data) {
        this.app_user_id = String(data);
        this.app_user_token = String(await this.getAppUserToken(app_user_external_id));
      }
    };

  /**
   * test_connection is a function to test the connection to the database.
   * @returns nothing
   * @example
   * await selas.test_connection();
   * @throws a typescript error
   */
  test_connection = async () => {
    const { data, error } = await this.owner_rpc("app_owner_echo", {
      message_app_owner: "check",
    });
    if (error) {
      this.handle_error(error);
    }
    if (data) {
      if (String(data) !== "check") {
        throw new Error(
          "There is a problem with the database. Contact the administrator."
        );
      }
    }
  };

  /**
   * getServiceList is a function to get the list of services available to this app.
   * @returns the list of services.
   * @example
   * const services = await selas.getServiceList();
   */
  getServiceList = async () => {
    var response;
    if (this.app_user_id == "")
      response = await this.owner_rpc("app_owner_get_services", {});
    else
      response = await this.user_rpc("app_user_get_services", {});
    const { data, error } = response;
    if (error) {
      this.handle_error(error);
    }
    if (data) {
      this.services = data;
    }
    return data;
  };

  /**
   * updateAddOnList is a function to update the list of add-ons available to this app.
   * @returns nothing.
   * @example
   * const add_ons = await selas.updateAddOnList();
   */
  updateAddOnList = async () => {
    var response;
    if (this.app_user_id == "")
      response = await this.owner_rpc("app_owner_get_add_ons", {});
    else
      response = await this.user_rpc("app_user_get_add_ons", {});
    const { data, error } = response;
    if (error) {
      this.handle_error(error);
    }
    if (data) {
      this.add_ons = data;
    }
  };    

  /**
   * getAddOnList is a function to get the list of add-ons available to this app.
   * @returns the list of add-ons.
   * @example
   * const add_ons = selas.getAddOnList();
   */
  getAddOnList = async () => {
      return this.add_ons
  };

  /**
   * Send a message to the selas server and wait for the same message to be received.
   * @param message - The message to send.
   * @returns a text message which is the same as the input message.
   */
  echo = async (message: string) => {
    const { data, error } = await this.owner_rpc("app_owner_echo", {
      message_app_owner: message,
    });
    if (error) {
      this.handle_error(error);
    }
    return data;
  };

  /***************  USER METHODS  ***************/

  /**
   * Create a new user for the app. This user will have 0 credits. This user will not be able to post jobs without a token.
   * @returns the id of the new user.
   */
  createAppUser = async (external_id: string) => {
    const { data, error } = await this.owner_rpc("app_owner_create_user", {
      p_external_id: external_id,
    });
    if (error) {
      this.handle_error(error);
    }
    return data;
  };

  /**
   * getUserId is a function to get the id of a user of the app, given its external id.
   * @param external_id - the external id of the user.
   * @returns the id of the user.
   */
  private getUserId = async (external_id: string) => {
    const { data, error } = await this.owner_rpc("app_owner_get_user_id", {
      p_app_user_external_id: external_id,
    });
    if (error) {
      this.handle_error(error);
    }
    return data;
  };

  /**
   * isUser is a function to check if a user of the app exists, given its external id.
   * @param external_id 
   * @returns true if the user exists, false otherwise.
   */
  isUser = async (external_id: string) => {
    let app_user_id = await this.getUserId(external_id);
    const { data, error } = await this.owner_rpc("app_owner_is_user", {
      p_app_user_id: app_user_id,
    });
    if (error) {
      this.handle_error(error);
    }
    return data;
  };

  /**
   * Create a token for a user of the app. This token allows the user to post jobs. The token can be deleted with the deactivateAppUser method.
   * @param app_user_id - the id of the user.
   * @returns a text that contains the token of the user.
   */
  createToken = async (app_user_external_id: string) => {
    let app_user_id = await this.getUserId(app_user_external_id);
    const { data, error } = await this.owner_rpc("app_owner_create_user_token", {
      p_app_user_id: app_user_id,
    });
    if (error) {
      this.handle_error(error);
    }
    return data;
  };

  /**
   * delete the token of a user of the app. A new token can be created with the createToken method.
   * @param app_user_id - the id of a user.
   * @returns true if the token was deleted; false otherwise.
   */
  deleteAllTokenOfAppUser = async (app_user_external_id: string) => {
    let app_user_id = await this.getUserId(app_user_external_id);
    var token = await this.owner_rpc("app_owner_get_token", {
      p_app_user_id: app_user_id,
    });
    if (token.error) {
      this.handle_error(token.error);
    }
    var deleted = await this.owner_rpc("app_owner_revoke_user_token", {
      p_app_user_id: app_user_id,
      p_token: token.data,
    });
    if (deleted.error) {
      this.handle_error(deleted.error);
    }
    return deleted.data;
  };

  /**
   * Get the token of a user of the app. This token allows the user to post jobs. The token can be deleted with the deactivateAppUser method.
   * @param app_user_id - the id of a user.
   * @returns a text that contains the token of the user.
   */
  getAppUserToken = async (app_user_external_id: string) => {
    let app_user_id = await this.getUserId(app_user_external_id);
    const { data, error } = await this.owner_rpc("app_owner_get_user_token_value", {
      p_app_user_id: app_user_id,
    });
    if (error) {
      this.handle_error(error);
    }
    return data;
  };

  /**
   * Allows the app owner to add credits to a user of the app.
   * @param app_user_id - the id of a user.
   * @param amount - the amount of credits to add.
   * @returns the new amount of credits of the user.
   */
  setCredit = async (app_user_external_id: string, amount: number) => {
    let app_user_id = await this.getUserId(app_user_external_id);
    const { data, error } = await this.owner_rpc("app_owner_set_user_credits", {
      p_amount: amount,
      p_app_user_id: app_user_id,
    });
    if (error) {
      this.handle_error(error);
    }
    return data;
  };

  /**
   * Allows the app owner to get the credits of a user of the app.
   * @param app_user_id - the id of a user.
   * @returns the amount of credits of the user.
   */
  getAppUserCredits = async (app_user_external_id: string) => {
    let app_user_id = await this.getUserId(app_user_external_id);
    const { data, error } = await this.owner_rpc("app_owner_get_user_credits", {
      p_app_user_id: app_user_id,
    });
    if (error) {
      this.handle_error(error);
    }
    return data;
  };

  /**
   * Get the job history of a user of the app.
   * @param app_user_id - the id of a user.
   * @param p_limit - the maximum number of jobs to return.
   * @param p_offset - the offset of the first job to return.
   * @returns the job history of the user.
   * @example
   * client.getAppUserJobHistory({app_user_id: "1", p_limit: 10, p_offset: 0});
   */
  getAppUserJobHistory = async (
    app_user_external_id: string,
    p_limit: number,
    p_offset: number
  ) => {
    let app_user_id = await this.getUserId(app_user_external_id);
    const { data, error } = await this.owner_rpc("app_owner_get_job_history_detail", {
      p_app_user_id: app_user_id,
      p_limit: p_limit,
      p_offset: p_offset,
    });
    if (error) {
      this.handle_error(error);
    }
    return data;
  };

  /***************  ADD-ONS METHODS  ***************/

  /**
   * shareAddOn - share an add-on with another user of the same application
   * @param add_on_name - the name of the add-on to share
   * @param app_user_external_id - the external id of the user to share the add-on with
   */
  shareAddOn = async (add_on_name: string, app_user_external_id: string) => {
    await this.updateAddOnList();
    const my_add_on = this.add_ons.find(
      (add_on) => add_on.name === add_on_name
    );

    if (!my_add_on) {
      throw new Error(`The add-on ${add_on_name} does not exist`);
    }

    const { data, error } = await this.owner_rpc("app_owner_share_add_on", {
      p_add_on_id: my_add_on.id,
      p_app_user_external_id: app_user_external_id,
    });
    if (error) {
      this.handle_error(error);
    }
    return data;
  };

  /**
   * deleteAddOn - delete an add-on that belongs to the application
   * @param add_on_name - the name of the add-on to delete
   * @returns true if the add-on was deleted
   * @throws an error if not
   */
  deleteAddOn = async (add_on_name: string) => {
    const my_add_on = this.add_ons.find(
      (add_on) => add_on.name === add_on_name
    );

    if (!my_add_on) {
      throw new Error(`The add-on ${add_on_name} does not exist`);
    }

    const { data, error } = await this.owner_rpc("app_owner_delete_add_on", {
      p_add_on_id: my_add_on.id,
    });

    if (error) {
      this.handle_error(error);
    }

    return data;
  };

  /**
   * renameAddOn - rename an add-on that belongs to the application
   * @param add_on_name
   * @param new_add_on_name
   * @returns true if the add-on was renamed
   */
  renameAddOn = async (add_on_name: string, new_add_on_name: string) => {
    const my_add_on = this.add_ons.find(
      (add_on) => add_on.name === add_on_name
    );

    if (!my_add_on) {
      throw new Error(`The add-on ${add_on_name} does not exist`);
    }

    let can_rename = await this.owner_rpc("app_owner_can_rename", {
      p_add_on_id: my_add_on.id,
      p_new_name: new_add_on_name,
    });

    if (can_rename.error) {
      this.handle_error(can_rename.error);
    }

    if (!can_rename.data) {
      throw new Error(`The name ${new_add_on_name} is not available`);
    }

    const { data, error } = await this.owner_rpc("app_owner_rename_add_on", {
      p_add_on_id: my_add_on.id,
      p_new_name: new_add_on_name,
    });

    await this.updateAddOnList();

    if (error) {
      this.handle_error(error);
    }

    return data;
  };

  /**
   * publishAddOn - publish an add-on that belongs to the application
   * @param add_on_name
   * @returns true if the add-on was published
   * @throws an error if not
   * @example
   * const is_published = client.publishAddOn("my_add_on");
   */
  publishAddOn = async (add_on_name: string) => {
    const my_add_on = this.add_ons.find(
      (add_on) => add_on.name === add_on_name
    );

    if (!my_add_on) {
      throw new Error(`The add-on ${add_on_name} does not exist`);
    }

    const { data, error } = await this.owner_rpc("app_owner_publish_add_on", {
      p_add_on_id: my_add_on.id,
    });

    if (error) {
      this.handle_error(error);
    }

    return data;
  };

  /**
   * unpublishAddOn - unpublish an add-on that belongs to the application
   * @param add_on_name
   * @returns true if the add-on was unpublished
   * @throws an error if not
   * @example
   * const is_unpublished = client.unpublishAddOn("my_add_on");
   */
  unpublishAddOn = async (add_on_name: string) => {
    const my_add_on = this.add_ons.find(
      (add_on) => add_on.name === add_on_name
    );

    if (!my_add_on) {
      throw new Error(`The add-on ${add_on_name} does not exist`);
    }

    const { data, error } = await this.owner_rpc("app_owner_unpublish_add_on", {
      p_add_on_id: my_add_on.id,
    });

    if (error) {
      this.handle_error(error);
    }

    return data;
  };    
  /***************  JOB METHODS  ***************/

  /**
   * Create a new job. This job will be executed by the workers of the app.
   * @param service_id - the id of the service that will be executed.
   * @param job_config - the configuration of the job.
   * @returns the id of the job.
   */
  private postJob = async (service_name: string, job_config: object) => {
    const service = this.services.find(
      (service) => service.name === service_name
    );
    if (!service) {
      throw new Error("Invalid model name");
    }

    var response;
    if (this.app_user_id == "")
      response = await this.owner_rpc("app_owner_post_job_admin", {
        p_service_id: service["id"],
        p_job_config: JSON.stringify(job_config),
        p_worker_filter: this.worker_filter,
      });
    else
      response = await this.user_rpc("post_job", {
        p_service_id: service["id"],
        p_job_config: JSON.stringify(job_config),
        p_worker_filter: this.worker_filter,
      });
    const { data, error } = response;

    if (error) {
      this.handle_error(error);
    }
    return data;
  };

  /**
   * Get the result of a job.
   * @param job_id - the id of the job.
   * @returns a json object containing the result of the job.
   * @example
   * const { data, error } = await selas.getResult({job_id: response.data});
   */
  getResult = async (job_id: string) => {
    const { data, error } = await this.owner_rpc("app_owner_get_result", {
      p_job_id: job_id,
    });
    if (error) {
      this.handle_error(error);
    }
    return data;
  };

  /**
   * Wait for the  the result of a job and returns it.
   * @param job_id - the id of the job.
   * @callback - the function that will be used to process the result of the job.
   * @example
   *  client.subscribeToJob({job_id: response.data, callback: function (data) { console.log(data); }});
   */
  subscribeToJob = async (job_id: string, callback: (result: object) => void ) => {
    const client = new Pusher("ed00ed3037c02a5fd912", {
      cluster: "eu",
    });

    client.connection.connectionCallbacks['close'] = (_:any) => {
      //pass
    };
    

    const channel = client.subscribe(`job-${job_id}`);

    const fn : (result: object) => void = function (data) {
      callback(data);
      if ("result" in data) {
        client.unsubscribe(`job-${job_id}`);
        client.disconnect();
      }
    };

    channel.bind("result", fn);
  };

  /**
   * Get the cost a StableDiffusion job on Selas API.
   *
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
   **/
  costStableDiffusion = async (
    prompt: string,
    args?: {
      service_name?: string;
      steps?: number;
      skip_steps?: number;
      batch_size?: 1 | 2 | 4 | 8 | 16;
      sampler?:
        | "plms"
        | "ddim"
        | "k_lms"
        | "k_euler"
        | "k_euler_a"
        | "dpm_multistep";
      guidance_scale?: number;
      width?: 384 | 448 | 512 | 575 | 768 | 640 | 704 | 768;
      height?: 384 | 448 | 512 | 575 | 768 | 640 | 704 | 768;
      negative_prompt?: string;
      image_format?: "png" | "jpeg" | "avif" | "webp";
      translate_prompt?: boolean;
      nsfw_filter?: boolean;
      patches?: PatchConfig[];
    }
  ) => {
    const service_name = args?.service_name || "stable-diffusion-2-1-base";
    // check if the model name has stable-diffusion as an interface
    if (!this.services.find((service) => service.name === service_name)) {
      throw new Error(`The service ${service_name} does not exist`);
    }
    const service_interface = this.services.find(
      (service) => service.name === service_name
    ).interface;
    if (service_interface !== "stable-diffusion") {
      throw new Error(
        `The service ${service_name} does not have the stable-diffusion interface`
      );
    }

    // check if the add on is available for this service
    for (const patch of args?.patches || []) {
      if (!this.add_ons.find((add_on) => add_on.name === patch.name)) {
        throw new Error(`The add-on ${patch.name} does not exist`);
      }
      //let service = this.add_ons.find(add_on => add_on.name === patch.name).service_name;
      //console.log(service);
      if (
        !this.add_ons
          .find((add_on) => add_on.name === patch.name)
          .service_name.includes(service_name)
      ) {
        throw new Error(
          `The service ${service_name} does not have the add-on ${patch.name}`
        );
      }
    }

    let add_ons = args?.patches?.map((patch) =>
      this.patchConfigToAddonConfig(patch)
    );

    const config: StableDiffusionConfig = {
      steps: args?.steps || 28,
      skip_steps: args?.skip_steps || 0,
      batch_size: args?.batch_size || 1,
      sampler: args?.sampler || "k_euler",
      guidance_scale: args?.guidance_scale || 10,
      width: args?.width || 512,
      height: args?.height || 512,
      prompt: prompt || "banana in the kitchen",
      negative_prompt: args?.negative_prompt || "ugly",
      image_format: args?.image_format || "jpeg",
      translate_prompt: args?.translate_prompt || false,
      nsfw_filter: args?.nsfw_filter || false,
      add_ons: add_ons,
    };

    const service = this.services.find(
      (service) => service.name === service_name
    );
    if (!service) {
      throw new Error("Invalid model name");
    }

    const { data, error } = await this.supabase.rpc(
      "get_service_config_cost_client",
      { p_service_id: service["id"], p_config: JSON.stringify(config) }
    );
    if (error) {
      this.handle_error(error);
    }
    return data;
  };

  /**
   * Run a StableDiffusion job on Selas API. The job will be run on the first available worker.
   *
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
   **/
  runStableDiffusion = async (
    prompt: string,
    args?: {
      service_name?: string;
      steps?: number;
      skip_steps?: number;
      batch_size?: 1 | 2 | 4 | 8 | 16;
      sampler?:
        | "plms"
        | "ddim"
        | "k_lms"
        | "k_euler"
        | "k_euler_a"
        | "dpm_multistep";
      guidance_scale?: number;
      width?: 384 | 448 | 512 | 575 | 768 | 640 | 704 | 768;
      height?: 384 | 448 | 512 | 575 | 768 | 640 | 704 | 768;
      negative_prompt?: string;
      image_format?: "png" | "jpeg" | "avif" | "webp";
      seed?: number;
      translate_prompt?: boolean;
      nsfw_filter?: boolean;
      patches?: PatchConfig[];
      callback? : (result: any) => void;
    }
  ) => {
    const service_name = args?.service_name || "stable-diffusion-2-1-base";
    // check if the model name has stable-diffusion as an interface
    if (!this.services.find((service) => service.name === service_name)) {
      throw new Error(`The service ${service_name} does not exist`);
    }
    const service_interface = this.services.find(
      (service) => service.name === service_name
    ).interface;
    if (service_interface !== "stable-diffusion") {
      throw new Error(
        `The service ${service_name} does not have the stable-diffusion interface`
      );
    }

    // check if the add on is available for this service
    for (const patch of args?.patches || []) {
      if (!this.add_ons.find((add_on) => add_on.name === patch.name)) {
        throw new Error(`The add-on ${patch.name} does not exist`);
      }
      //let service = this.add_ons.find(add_on => add_on.name === patch.name).service_name;
      //console.log(service);
      if (
        !this.add_ons
          .find((add_on) => add_on.name === patch.name)
          .service_name.includes(service_name)
      ) {
        throw new Error(
          `The service ${service_name} does not have the add-on ${patch.name}`
        );
      }
    }

    let add_ons = args?.patches?.map((patch) =>
      this.patchConfigToAddonConfig(patch)
    );

    const config: StableDiffusionConfig = {
      steps: args?.steps || 28,
      skip_steps: args?.skip_steps || 0,
      batch_size: args?.batch_size || 1,
      sampler: args?.sampler || "k_euler",
      guidance_scale: args?.guidance_scale || 10,
      width: args?.width || 512,
      height: args?.height || 512,
      prompt: prompt || "banana in the kitchen",
      negative_prompt: args?.negative_prompt || "ugly",
      image_format: args?.image_format || "jpeg",
      translate_prompt: args?.translate_prompt || false,
      nsfw_filter: args?.nsfw_filter || false,
      add_ons: add_ons,
      seed: args?.seed
    };
    var current_callback = args?.callback || function (data) {console.log(data);};
    const response = await this.postJob(service_name, config);
    if (response){
      if ("job_id" in response){
        const result = await this.subscribeToJob(String(response['job_id']), current_callback );
        return result;
      }
    }
    return response;
  };

  /**
   * patchConfigToAddonConfig - convert a patch config to the correct format for the add-on config
   * @param patch_config - the patch config
   * @returns the add-on config
   * @private
   */
  private patchConfigToAddonConfig = (patch_config: PatchConfig) => {
    return {
      id: this.add_ons.find((add_on) => add_on.name === patch_config.name).id,
      config: {
        alpha_unet: patch_config.alpha_unet,
        alpha_text_encoder: patch_config.alpha_text_encoder,
        steps: patch_config.steps,
      },
    };
  };

  /**
   * costPatchTrainer - Get the cost of a patch training job
   * @param dataset - the dataset to train the patch
   * @param patch_name - the name of the patch
   * @param args.service_name - the name of the service on which the patch will be trained
   * @param args.description - the description of the patch
   * @param args.learning_rate - the learning rate
   * @param args.steps - the number of steps to train the patch
   * @param args.rank - the rank of the patch
   * @returns a json object with the id and the cost of the job
   */
  costPatchTrainer = async (
    dataset: TrainingImage[],
    patch_name: string,
    args?: {
      service_name?: string;
      description?: string;
      learning_rate?: number;
      steps?: number;
      rank?: number;
    }
  ) => {
    const service_name = args?.service_name || "patch_trainer_v1";
    // check if the model name has stable-diffusion as an interface
    if (!this.services.find((service) => service.name === service_name)) {
      throw new Error(`The service ${service_name} does not exist`);
    }
    const service_interface = this.services.find(
      (service) => service.name === service_name
    ).interface;
    if (service_interface !== "train-patch-stable-diffusion") {
      throw new Error(
        `The service ${service_name} does not have the train-patch-stable-diffusion interface`
      );
    }

    await this.updateAddOnList();

    // check if the patch name is in add_ons
    if (!this.add_ons.find((add_on) => add_on.name === patch_name)) {
      throw new Error(`The add-on ${patch_name} does not exist`);
    }

    const trainerConfig: PatchTrainerConfig = {
      dataset: dataset,
      patch_name: patch_name,
      description: args?.description || "",
      learning_rate: args?.learning_rate || 1e-4,
      steps: args?.steps || 100,
      rank: args?.rank || 4,
    };

    const service = this.services.find(
      (service) => service.name === service_name
    );
    if (!service) {
      throw new Error("Invalid model name");
    }

    const { data, error } = await this.supabase.rpc(
      "get_service_config_cost_client",
      { p_service_id: service["id"], p_config: JSON.stringify(trainerConfig) }
    );
    if (error) {
      this.handle_error(error);
    }
    return data;
  };

  /**
   * runPatchTrainer - train a patch
   * @param dataset - the dataset to train the patch
   * @param patch_name - the name of the patch
   * @param args.service_name - the name of the service on which the patch will be trained
   * @param args.description - the description of the patch
   * @param args.learning_rate - the learning rate
   * @param args.steps - the number of steps to train the patch
   * @param args.rank - the rank of the patch
   * @returns a json object with the id and the cost of the job
   */
  runPatchTrainer = async (
    dataset: TrainingImage[],
    patch_name: string,
    args?: {
      service_name?: string;
      description?: string;
      learning_rate?: number;
      steps?: number;
      rank?: number;
    },
    callback? : (result: Object) => void
  ) => {
    const service_name = args?.service_name || "patch_trainer_v1";
    // check if the model name has stable-diffusion as an interface
    if (!this.services.find((service) => service.name === service_name)) {
      throw new Error(`The service ${service_name} does not exist`);
    }
    const service_interface = this.services.find(
      (service) => service.name === service_name
    ).interface;
    if (service_interface !== "train-patch-stable-diffusion") {
      throw new Error(
        `The service ${service_name} does not have the train-patch-stable-diffusion interface`
      );
    }

    if (callback == null){
      callback = function (data) {console.log(data);};
    }

    await this.updateAddOnList();

    // check if the patch name is already in add_ons
    if (this.add_ons.find((add_on) => add_on.name === patch_name)) {
      throw new Error(`The add-on ${patch_name} already exists`);
    }

    let is_creating = await this.owner_rpc("app_owner_is_creating_add_on", {
      p_add_on_name: patch_name,
    });
    if (is_creating.data) {
      throw new Error(`There is already an ${patch_name} add-on being created`);
    }

    const trainerConfig: PatchTrainerConfig = {
      dataset: dataset,
      patch_name: patch_name,
      description: args?.description || "",
      learning_rate: args?.learning_rate || 1e-4,
      steps: args?.steps || 100,
      rank: args?.rank || 4,
    };

    const response = await this.postJob(service_name, trainerConfig);
    if (response){
      if ("job_id" in response){
        const result = await this.subscribeToJob(String(response['job_id']),callback);
        return result;
      }
    }
    return response;
  };

  /**
   * getCountActiveWorker returns the number of active workers, depending on the worker_filter used.
   * @returns the number of active workers.
   * @example
   * const count = await selas.getCountActiveWorker();
   * console.log(count);
   */
  getCountActiveWorker = async () => {
    const { data, error } = await this.supabase.rpc("get_active_worker_count", {
      p_worker_filter: this.worker_filter,
    });
    if (error) {
      this.handle_error(error);
    }
    return data;
  };
}

/**
 * Create a selas client. The client can be used to access the API using the credentials created
 * on https://selas.ai. The client can be used to manage users, tokens and credits of an app. Be careful, the client
 * is not secure and should not be used in a browser.
 *
 * @param credentials - the credentials of the app. You can create them on https://selas.ai
 *
 * @returns a SelasClient object.
 *
 * @example
 * Create a app owner client.
 * ```ts
 * const client = await createCLient({app_id: "9a8b7c6d5e4f3g2h1i0j", app_key: "e9t#ah9-t", app_secret: "a9t#ah9-t"});
 * ```
 *
 */
export const createSelasClient = async (
  credentials: { app_id: string; key: string; secret: string, app_user_external_id?: string},
  worker_filter?: WorkerFilter
) => {
  const SUPABASE_URL = "https://lgwrsefyncubvpholtmh.supabase.co";
  const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnd3JzZWZ5bmN1YnZwaG9sdG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk0MDE0MzYsImV4cCI6MTk4NDk3NzQzNn0.o-QO3JKyJ5E-XzWRPC9WdWHY8WjzEFRRnDRSflLzHsc";

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true },
  });


  const selas = new SelasClient(
    supabase,
    credentials.app_id,
    credentials.key,
    credentials.secret,
    worker_filter
  );

  await selas.test_connection();

  if (credentials.app_user_external_id)
    await selas.setUserID(credentials.app_user_external_id);

  await selas.getServiceList();
  await selas.updateAddOnList();

  return selas;
};
