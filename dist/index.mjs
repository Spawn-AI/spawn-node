import { createClient } from '@supabase/supabase-js';

var Pusher = require("pusher-client");
class SelasClient {
  constructor(supabase, app_id, key, secret, worker_filter) {
    this.getServiceList = async () => {
      const { data, error } = await this.rpc("app_owner_get_services", {});
      if (data) {
        this.services = data;
      }
      return { data, error };
    };
    this.rpc = async (fn, params) => {
      const paramsWithSecret = { ...params, p_secret: this.secret, p_app_id: this.app_id, p_key: this.key };
      const { data, error } = await this.supabase.rpc(fn, paramsWithSecret);
      return { data, error };
    };
    this.echo = async (args) => {
      return await this.rpc("app_owner_echo", { message_app_owner: args.message });
    };
    this.getAppSuperUser = async () => {
      const { data, error } = await this.rpc("app_owner_get_super_user", {});
      if (!error) {
        return { data: String(data), error };
      } else {
        return { data, error };
      }
    };
    this.createAppUser = async () => {
      const { data, error } = await this.rpc("app_owner_create_user", {});
      if (!error) {
        return { data: String(data), error };
      } else {
        return { data, error };
      }
    };
    this.createToken = async (args) => {
      const { data, error } = await this.rpc("app_owner_create_user_token", { p_app_user_id: args.app_user_id });
      if (error) {
        return { data, error };
      } else {
        return { data: String(data), error };
      }
    };
    this.getAppUserToken = async (args) => {
      const { data, error } = await this.rpc("app_owner_get_user_token_value", { p_app_user_id: args.app_user_id });
      if (!error) {
        return { data: String(data), error };
      } else {
        return { data, error };
      }
    };
    this.setCredit = async (args) => {
      const { data, error } = await this.rpc("app_owner_set_user_credits", {
        p_amount: args.amount,
        p_app_user_id: args.app_user_id
      });
      return { data, error };
    };
    this.getAppUserCredits = async (args) => {
      const { data, error } = await this.rpc("app_owner_get_user_credits", { p_app_user_id: args.app_user_id });
      return { data, error };
    };
    this.deleteAllTokenOfAppUser = async (args) => {
      var token = await this.rpc("app_owner_get_token", { p_app_user_id: args.app_user_id });
      var deleted = await this.rpc("app_owner_revoke_user_token", {
        p_app_user_id: args.app_user_id,
        p_token: token.data
      });
      return deleted;
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
      return { data, error };
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
      return { data, error };
    };
    this.getAppUserJobHistory = async (args) => {
      const { data, error } = await this.rpc("app_owner_get_job_history_detail", {
        p_app_user_id: args.app_user_id,
        p_limit: args.p_limit,
        p_offset: args.p_offset
      });
      return { data, error };
    };
    this.subscribeToJob = async (args) => {
      const client = new Pusher("ed00ed3037c02a5fd912", {
        cluster: "eu"
      });
      const channel = client.subscribe(`job-${args.job_id}`);
      channel.bind("result", args.callback);
    };
    this.runStableDiffusion = async (args, model_name) => {
      const response = await this.postJob({
        service_name: model_name,
        job_config: args
      });
      if (response.error) {
        return { data: null, error: response.error };
      } else {
        return { data: response.data, error: null };
      }
    };
    this.supabase = supabase;
    this.app_id = app_id;
    this.key = key;
    this.secret = secret;
    this.worker_filter = worker_filter || { branch: "prod" };
    this.services = [];
  }
}
const createSelasClient = async (credentials, worker_filter) => {
  const SUPABASE_URL = "https://lgwrsefyncubvpholtmh.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnd3JzZWZ5bmN1YnZwaG9sdG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk0MDE0MzYsImV4cCI6MTk4NDk3NzQzNn0.o-QO3JKyJ5E-XzWRPC9WdWHY8WjzEFRRnDRSflLzHsc";
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const selas = new SelasClient(supabase, credentials.app_id, credentials.key, credentials.secret, worker_filter);
  await selas.getServiceList();
  return selas;
};

export { SelasClient, createSelasClient };
