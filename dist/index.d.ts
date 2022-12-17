import * as _supabase_supabase_js from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';

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
    sampler: "plms" | "ddim" | "k_lms" | "k_euler" | "k_euler_a" | "dpm_multistep";
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
    services: any[];
    constructor(supabase: SupabaseClient, app_id: string, key: string, secret: string, worker_filter?: WorkerFilter);
    getServiceList: () => Promise<{
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError | null;
    }>;
    private rpc;
    echo: (args: {
        message: string;
    }) => Promise<{
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
    createAppUser: () => Promise<{
        data: string;
        error: null;
    } | {
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError;
    }>;
    createToken: (args: {
        app_user_id: string;
    }) => Promise<{
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError;
    } | {
        data: string;
        error: null;
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
    setCredit: (args: {
        app_user_id: string;
        amount: number;
    }) => Promise<{
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError | null;
    }>;
    getAppUserCredits: (args: {
        app_user_id: string;
    }) => Promise<{
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError | null;
    }>;
    deleteAllTokenOfAppUser: (args: {
        app_user_id: string;
    }) => Promise<{
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError | null;
    }>;
    getServiceConfigCost: (args: {
        service_name: string;
        job_config: object;
    }) => Promise<{
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError | null;
    }>;
    postJob: (args: {
        service_name: string;
        job_config: object;
    }) => Promise<{
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError | null;
    }>;
    getAppUserJobHistory: (args: {
        app_user_id: string;
        p_limit: number;
        p_offset: number;
    }) => Promise<{
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError | null;
    }>;
    subscribeToJob: (args: {
        job_id: string;
        callback: (result: object) => void;
    }) => Promise<void>;
    runStableDiffusion: (args: StableDiffusionConfig, model_name: string) => Promise<{
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

export { SelasClient, StableDiffusionConfig, WorkerFilter, createSelasClient };
