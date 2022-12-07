import { createClient, SupabaseClient } from "@supabase/supabase-js";
var Pusher = require('pusher-client');

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
  sampler: "plms" | "ddim" | "k_lms" | "k_euler" | "k_euler_a";
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
  constructor(supabase: SupabaseClient, app_id: string, key: string, secret: string, worker_filter?: WorkerFilter) {
    this.supabase = supabase;
    this.app_id = app_id;
    this.key = key;
    this.secret = secret;
    this.worker_filter = worker_filter || { branch: "prod" };
  }

  /**
   * rpc is a wrapper around the supabase rpc function usable by the SelasClient.
   * @param fn - The name of the function to call.
   * @param params - The parameters to pass to the function.
   * @returns the result of the rpc call.
   * @example
   * const { data, error } = await this.rpc("app_owner_echo", {message_app_owner: "hello"});
   */
  private rpc = async (fn: string, params: any) => {
    const paramsWithSecret = { ...params, p_secret: this.secret, p_app_id: this.app_id, p_key: this.key };
    const { data, error } = await this.supabase.rpc(fn, paramsWithSecret);

    return { data, error };
  };

  /**
   * Send a message to the selas server and wait for the same message to be received.
   * @param message - The message to send.
   * @returns a text message which is the same as the input message.
   */
  echo = async (args: {message: string}) => {
    return await this.rpc("app_owner_echo", {message_app_owner: args.message});
  };

  /**
   * Get the super user of the app. This super user always has an infinite amount of credits and a token.  
   * @returns the id of the super user.
   */
  getAppSuperUser = async () => {
    const { data, error } = await this.rpc("app_owner_get_super_user", {});
    if (!error) {
      return { data: String(data), error };
    } else {
      return { data, error };
    }
  };

  /**
   * Create a new user for the app. This user will have 0 credits. This user will not be able to post jobs without a token.
   * @returns the id of the new user.
   */
  createAppUser = async () => {
    const { data, error } = await this.rpc("app_owner_create_user", {});
    if (!error) {
      return { data: String(data), error };
    } else {
      return { data, error };
    }
  };

  /**
   * Create a token for a user of the app. This token allows the user to post jobs. The token can be deleted with the deactivateAppUser method.
   * @param app_user_id - the id of the user.
   * @returns a text that contains the token of the user.
   */
  createToken = async (args: { app_user_id: string }) => {
    const { data, error } = await this.rpc("app_owner_create_user_token", { p_app_user_id: args.app_user_id });
    if (error) {
      return { data, error };
    } else {
      return { data: String(data), error };
    }
  }

  /**
   * Get the token of a user of the app. This token allows the user to post jobs. The token can be deleted with the deactivateAppUser method.
   * @param app_user_id - the id of a user.
   * @returns a text that contains the token of the user.
  */
  getAppUserToken = async (args: { app_user_id: string }) => {
    const { data, error } = await this.rpc("app_owner_get_user_token_value", { p_app_user_id: args.app_user_id });
    if (!error) {
      return { data: String(data), error };
    } else {
      return { data, error };
    }
  };

  /**
   * Allows the app owner to add credits to a user of the app.
   * @param app_user_id - the id of a user.
   * @param amount - the amount of credits to add.
   * @returns the new amount of credits of the user.
   */
  addCredit = async (args: { app_user_id: string; amount: number }) => {
      const { data, error } = await this.rpc("app_owner_add_user_credits", {
        p_amount: args.amount,
        p_app_user_id: args.app_user_id,
      });
      return { data, error };
    };

  /**
   * Allows the app owner to get the credits of a user of the app.
   * @param app_user_id - the id of a user.
   * @returns the amount of credits of the user.
   */
  getAppUserCredits = async (args: { app_user_id: string }) => {
    const { data, error } = await this.rpc("app_owner_get_user_credits", { p_app_user_id: args.app_user_id });
    return { data, error };
  };

  /**
   * delete the token of a user of the app. A new token can be created with the createToken method.
   * @param app_user_id - the id of a user.
   * @returns true if the token was deleted; false otherwise.
   */
  deactivateAppUser = async (args: { app_user_id: string }) => {
    var token = await this.rpc("app_owner_get_token", { p_app_user_id: args.app_user_id });
    var deleted = await this.rpc("app_owner_revoke_user_token", {
      p_app_user_id: args.app_user_id,
      p_token: token.data,
    });
    return deleted;
  };

  /**
   * Create a new job. This job will be executed by the workers of the app.
   * @param service_id - the id of the service that will be executed.
   * @param job_config - the configuration of the job.
   * @returns the id of the job.
   */
  postJob = async (args: { service_id: string; job_config: string }) => {
    const { data, error } = await this.rpc("app_owner_post_job_admin", {
      p_service_id: args.service_id,
      p_job_config: args.job_config,
      p_worker_filter: this.worker_filter,
    });
    return { data, error };
  };

  /**
   * Wait for the  the result of a job and returns it.
   * @param job_id - the id of the job.
   * @callback - the function that will be used to process the result of the job.
   * @example
   *  client.subscribeToJob({job_id: response.data, callback: function (data) { console.log(data); }});
   */
  subscribeToJob = async (args: { job_id: string; callback: (result: object) => void }) => {
    const client = new Pusher("ed00ed3037c02a5fd912", {
      cluster: "eu",
    });

    const channel = client.subscribe(`job-${args.job_id}`);
    channel.bind("result", args.callback);
  };

  




  /**
   * Run a StableDiffusion job on Selas API. The job will be run on the first available worker.
   *
   * @param args.prompt - the description of the image to be generated
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
  runStableDiffusion = async (args: StableDiffusionConfig) => {
    const response = await this.postJob({
      service_id: "04cdf9c4-5338-4e32-9e63-e15b2150d7f9",
      job_config: JSON.stringify(args),
    });

    if (response.error) {
      return { data: null, error: response.error };
    } else {
      return { data: response.data, error: null };
    }
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
  credentials: { app_id: string; key: string; secret: string },
  worker_filter?: WorkerFilter
) => {
  const SUPABASE_URL = "https://lgwrsefyncubvpholtmh.supabase.co";
  const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnd3JzZWZ5bmN1YnZwaG9sdG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk0MDE0MzYsImV4cCI6MTk4NDk3NzQzNn0.o-QO3JKyJ5E-XzWRPC9WdWHY8WjzEFRRnDRSflLzHsc";

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

  return new SelasClient(supabase, credentials.app_id, credentials.key, credentials.secret, worker_filter);
};
