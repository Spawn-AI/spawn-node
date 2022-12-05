import * as _supabase_supabase_js from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';

type Customer = {
    id?: string;
    external_id: string;
    user_id: string;
    credits: number;
};
type Token = {
    id?: string;
    key: string;
    created_at?: string;
    user_id: string;
    ttl: number;
    quota: number;
    customer_id: string;
    description?: string;
};
type WorkerFilter = {
    id?: string;
    name?: string;
    branch?: string;
    is_dirty?: boolean;
    cluster?: number;
};
type StableDiffusionConfig = {
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
declare class SelasClient {
    supabase: SupabaseClient;
    app_id: string;
    key: string;
    secret: string;
    worker_filter: WorkerFilter;
    constructor(supabase: SupabaseClient, app_id: string, key: string, secret: string, worker_filter?: WorkerFilter);
    rpc: (fn: string, params: any) => Promise<{
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError | null;
    }>;
    echo: () => Promise<{
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError | null;
    }>;
    getAppSuperUser: () => Promise<{
        data: string;
        error: null;
    } | {
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError;
    }>;
    getAppUserToken: (args: {
        app_user_id: string;
    }) => Promise<{
        data: string;
        error: null;
    } | {
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError;
    }>;
    createAppUser: () => Promise<{
        data: string;
        error: null;
    } | {
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError;
    }>;
    getAppUserCredits: (args: {
        app_user_id: string;
    }) => Promise<{
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError | null;
    }>;
    deactivateAppUser: (args: {
        app_user_id: string;
    }) => Promise<{
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError | null;
    }>;
    postJob: (args: {
        service_id: string;
        job_config: string;
    }) => Promise<{
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError | null;
    }>;
    subscribeToJob: (args: {
        job_id: string;
        callback: (result: object) => void;
    }) => void;
    addCredit: (args: {
        app_user_id: string;
        amount: number;
    }) => Promise<{
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError | null;
    }>;
    createToken(args: {
        app_user_id: string;
    }): Promise<{
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError;
    } | {
        data: string;
        error: null;
    }>;
    runStableDiffusion: (args: StableDiffusionConfig) => Promise<{
        data: null;
        error: _supabase_supabase_js.PostgrestError;
    } | {
        data: any[] | null;
        error: null;
    }>;
}
declare const createSelasClient: (credentials: {
    app_id: string;
    key: string;
    secret: string;
}, worker_filter?: WorkerFilter) => Promise<SelasClient>;

export { Customer, SelasClient, StableDiffusionConfig, Token, WorkerFilter, createSelasClient };
