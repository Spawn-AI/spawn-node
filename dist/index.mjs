import { createClient } from '@supabase/supabase-js';
import Pusher from 'pusher-client';

function PatchConfig(name, alpha_text_encoder, alpha_unet, steps) {
  return {
    name,
    alpha_text_encoder: alpha_text_encoder || 1,
    alpha_unet: alpha_unet || 1,
    steps: steps || 100
  };
}
class SelasClient {
  constructor(supabase, app_id, key, secret, worker_filter) {
    this.handle_error = (error) => {
      if (error.code === "") {
        throw new Error("The database cannot be reached. Contact the administrator.");
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
    };
    this.test_connection = async () => {
      const { data, error } = await this.rpc("app_user_echo", { message_app_user: "check" });
      if (error) {
        this.handle_error(error);
      }
      if (data) {
        if (String(data) !== "check") {
          throw new Error("There is a problem with the database. Contact the administrator.");
        }
      }
    };
    this.getServiceList = async () => {
      const { data, error } = await this.rpc("app_owner_get_services", {});
      if (error) {
        this.handle_error(error);
      }
      if (data) {
        this.services = data;
      }
      return data;
    };
    this.getAddOnList = async () => {
      const { data, error } = await this.rpc("app_owner_get_add_ons", {});
      if (error) {
        this.handle_error(error);
      }
      if (data) {
        this.add_ons = data;
      }
      return data;
    };
    this.rpc = async (fn, params) => {
      const paramsWithSecret = { ...params, p_secret: this.secret, p_app_id: this.app_id, p_key: this.key };
      const { data, error } = await this.supabase.rpc(fn, paramsWithSecret);
      return { data, error };
    };
    this.echo = async (args) => {
      const { data, error } = await this.rpc("app_owner_echo", { message_app_owner: args.message });
      if (error) {
        this.handle_error(error);
      }
      return data;
    };
    this.createAppUser = async (args) => {
      const { data, error } = await this.rpc("app_owner_create_user", { p_external_id: args.external_id });
      if (error) {
        this.handle_error(error);
      }
      return data;
    };
    this.getUserId = async (args) => {
      const { data, error } = await this.rpc("app_owner_get_user_id", { p_app_user_external_id: args.external_id });
      if (error) {
        this.handle_error(error);
      }
      return data;
    };
    this.createToken = async (args) => {
      let app_user_id = await this.getUserId({ external_id: args.app_user_external_id });
      const { data, error } = await this.rpc("app_owner_create_user_token", { p_app_user_id: app_user_id });
      if (error) {
        this.handle_error(error);
      }
      return data;
    };
    this.getAppUserToken = async (args) => {
      let app_user_id = await this.getUserId({ external_id: args.app_user_external_id });
      const { data, error } = await this.rpc("app_owner_get_user_token_value", { p_app_user_id: app_user_id });
      if (error) {
        this.handle_error(error);
      }
      return data;
    };
    this.setCredit = async (args) => {
      let app_user_id = await this.getUserId({ external_id: args.app_user_external_id });
      const { data, error } = await this.rpc("app_owner_set_user_credits", {
        p_amount: args.amount,
        p_app_user_id: app_user_id
      });
      if (error) {
        this.handle_error(error);
      }
      return data;
    };
    this.getAppUserCredits = async (args) => {
      let app_user_id = await this.getUserId({ external_id: args.app_user_external_id });
      const { data, error } = await this.rpc("app_owner_get_user_credits", { p_app_user_id: app_user_id });
      if (error) {
        this.handle_error(error);
      }
      return data;
    };
    this.deleteAllTokenOfAppUser = async (args) => {
      let app_user_id = await this.getUserId({ external_id: args.app_user_external_id });
      var token = await this.rpc("app_owner_get_token", { p_app_user_id: app_user_id });
      if (token.error) {
        this.handle_error(token.error);
      }
      var deleted = await this.rpc("app_owner_revoke_user_token", {
        p_app_user_id: app_user_id,
        p_token: token.data
      });
      if (deleted.error) {
        this.handle_error(deleted.error);
      }
      return deleted.data;
    };
    this.getServiceConfigCost = async (args) => {
      const service_id = this.services.find((service) => service.name === args.service_name)["id"];
      if (!service_id) {
        throw new Error("Invalid model name");
      }
      const { data, error } = await this.supabase.rpc("get_service_config_cost_client", {
        p_service_id: service_id,
        p_config: JSON.stringify(args.job_config)
      });
      if (error) {
        this.handle_error(error);
      }
      return data;
    };
    this.postJob = async (args) => {
      const service = this.services.find((service2) => service2.name === args.service_name);
      if (!service) {
        throw new Error("Invalid model name");
      }
      const { data, error } = await this.rpc("app_owner_post_job_admin", {
        p_service_id: service["id"],
        p_job_config: JSON.stringify(args.job_config),
        p_worker_filter: this.worker_filter
      });
      if (error) {
        this.handle_error(error);
      }
      return data;
    };
    this.getAppUserJobHistory = async (args) => {
      let app_user_id = await this.getUserId({ external_id: args.app_user_external_id });
      const { data, error } = await this.rpc("app_owner_get_job_history_detail", {
        p_app_user_id: app_user_id,
        p_limit: args.p_limit,
        p_offset: args.p_offset
      });
      if (error) {
        this.handle_error(error);
      }
      return data;
    };
    this.subscribeToJob = async (args) => {
      const client = new Pusher("ed00ed3037c02a5fd912", {
        cluster: "eu"
      });
      const channel = client.subscribe(`job-${args.job_id}`);
      channel.bind("result", args.callback);
    };
    this.patchConfigToAddonConfig = (patch_config) => {
      return {
        id: this.add_ons.find((add_on) => add_on.name === patch_config.name).id,
        config: {
          alpha_unet: patch_config.alpha_unet,
          alpha_text_encoder: patch_config.alpha_text_encoder,
          steps: patch_config.steps
        }
      };
    };
    this.runStableDiffusion = async (prompt, args) => {
      const service_name = args?.service_name || "stable-diffusion-2-1-base";
      if (!this.services.find((service) => service.name === service_name)) {
        throw new Error(`The service ${service_name} does not exist`);
      }
      const service_interface = this.services.find((service) => service.name === service_name).interface;
      if (service_interface !== "stable-diffusion") {
        throw new Error(`The service ${service_name} does not have the stable-diffusion interface`);
      }
      for (const patch of args?.patches || []) {
        if (!this.add_ons.find((add_on) => add_on.name === patch.name)) {
          throw new Error(`The add-on ${patch.name} does not exist`);
        }
        let service = this.add_ons.find((add_on) => add_on.name === patch.name).service_name;
        console.log(service);
        if (!this.add_ons.find((add_on) => add_on.name === patch.name).service_name.includes(service_name)) {
          throw new Error(`The service ${service_name} does not have the add-on ${patch.name}`);
        }
      }
      let add_ons = args?.patches?.map((patch) => this.patchConfigToAddonConfig(patch));
      const config = {
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
        add_ons
      };
      const response = await this.postJob({
        service_name,
        job_config: config
      });
      return response;
    };
    this.supabase = supabase;
    this.app_id = app_id;
    this.key = key;
    this.secret = secret;
    this.worker_filter = worker_filter || { branch: "prod" };
    this.services = [];
    this.add_ons = [];
  }
}
const createSelasClient = async (credentials, worker_filter) => {
  const SUPABASE_URL = "https://lgwrsefyncubvpholtmh.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnd3JzZWZ5bmN1YnZwaG9sdG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk0MDE0MzYsImV4cCI6MTk4NDk3NzQzNn0.o-QO3JKyJ5E-XzWRPC9WdWHY8WjzEFRRnDRSflLzHsc";
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const selas = new SelasClient(
    supabase,
    credentials.app_id,
    credentials.key,
    credentials.secret,
    worker_filter
  );
  await selas.test_connection();
  await selas.getServiceList();
  await selas.getAddOnList();
  return selas;
};

export { PatchConfig, SelasClient, createSelasClient };
