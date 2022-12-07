'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const supabaseJs = require('@supabase/supabase-js');

var Pusher = require("pusher-client");
class SelasClient {
  constructor(supabase, app_id, key, secret, worker_filter) {
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
    this.addCredit = async (args) => {
      const { data, error } = await this.rpc("app_owner_add_user_credits", {
        p_amount: args.amount,
        p_app_user_id: args.app_user_id
      });
      return { data, error };
    };
    this.getAppUserCredits = async (args) => {
      const { data, error } = await this.rpc("app_owner_get_user_credits", { p_app_user_id: args.app_user_id });
      return { data, error };
    };
    this.deactivateAppUser = async (args) => {
      var token = await this.rpc("app_owner_get_token", { p_app_user_id: args.app_user_id });
      var deleted = await this.rpc("app_owner_revoke_user_token", {
        p_app_user_id: args.app_user_id,
        p_token: token.data
      });
      return deleted;
    };
    this.postJob = async (args) => {
      const { data, error } = await this.rpc("app_owner_post_job_admin", {
        p_service_id: args.service_id,
        p_job_config: args.job_config,
        p_worker_filter: this.worker_filter
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
    this.runStableDiffusion = async (args) => {
      const response = await this.postJob({
        service_id: "04cdf9c4-5338-4e32-9e63-e15b2150d7f9",
        job_config: JSON.stringify(args)
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
  }
}
const createSelasClient = async (credentials, worker_filter) => {
  const SUPABASE_URL = "https://lgwrsefyncubvpholtmh.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnd3JzZWZ5bmN1YnZwaG9sdG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk0MDE0MzYsImV4cCI6MTk4NDk3NzQzNn0.o-QO3JKyJ5E-XzWRPC9WdWHY8WjzEFRRnDRSflLzHsc";
  const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  return new SelasClient(supabase, credentials.app_id, credentials.key, credentials.secret, worker_filter);
};

exports.SelasClient = SelasClient;
exports.createSelasClient = createSelasClient;
