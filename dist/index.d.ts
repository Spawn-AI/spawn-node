import { SupabaseClient } from '@supabase/supabase-js';

type WorkerFilter = {
    id?: string;
    name?: string;
    branch?: string;
    is_dirty?: boolean;
    cluster?: number;
};
type PatchConfig = {
    name: string;
    alpha_text_encoder: number;
    alpha_unet: number;
    steps: number;
};
declare function PatchConfig(name: string, alpha_text_encoder?: number, alpha_unet?: number, steps?: number): PatchConfig;
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
    add_ons?: any[];
};
type Patch = {
    name: string;
    alpha_text_encoder: number;
    alpha_unet: number;
};
declare class SelasClient {
    supabase: SupabaseClient;
    app_id: string;
    key: string;
    secret: string;
    worker_filter: WorkerFilter;
    services: any[];
    add_ons: any[];
    constructor(supabase: SupabaseClient, app_id: string, key: string, secret: string, worker_filter?: WorkerFilter);
    handle_error: (error: any) => void;
    test_connection: () => Promise<void>;
    getServiceList: () => Promise<any[] | null>;
    getAddOnList: () => Promise<any[] | null>;
    private rpc;
    echo: (args: {
        message: string;
    }) => Promise<any[] | null>;
    createAppUser: (args: {
        external_id: string;
    }) => Promise<any[] | null>;
    private getUserId;
    createToken: (args: {
        app_user_external_id: string;
    }) => Promise<any[] | null>;
    getAppUserToken: (args: {
        app_user_external_id: string;
    }) => Promise<any[] | null>;
    setCredit: (args: {
        app_user_external_id: string;
        amount: number;
    }) => Promise<any[] | null>;
    getAppUserCredits: (args: {
        app_user_external_id: string;
    }) => Promise<any[] | null>;
    deleteAllTokenOfAppUser: (args: {
        app_user_external_id: string;
    }) => Promise<any[] | null>;
    getServiceConfigCost: (args: {
        service_name: string;
        job_config: object;
    }) => Promise<any[] | null>;
    postJob: (args: {
        service_name: string;
        job_config: object;
    }) => Promise<any[] | null>;
    getAppUserJobHistory: (args: {
        app_user_external_id: string;
        p_limit: number;
        p_offset: number;
    }) => Promise<any[] | null>;
    subscribeToJob: (args: {
        job_id: string;
        callback: (result: object) => void;
    }) => Promise<void>;
    private patchConfigToAddonConfig;
    runStableDiffusion: (prompt: string, args?: {
        service_name?: string;
        steps?: number;
        skip_steps?: number;
        batch_size?: 1 | 2 | 4 | 8 | 16;
        sampler?: "plms" | "ddim" | "k_lms" | "k_euler" | "k_euler_a" | "dpm_multistep";
        guidance_scale?: number;
        width?: 384 | 448 | 512 | 575 | 768 | 640 | 704 | 768;
        height?: 384 | 448 | 512 | 575 | 768 | 640 | 704 | 768;
        negative_prompt?: string;
        image_format?: "png" | "jpeg" | "avif" | "webp";
        translate_prompt?: boolean;
        nsfw_filter?: boolean;
        patches?: PatchConfig[];
    }) => Promise<any[] | null>;
    getCountActiveWorker: () => Promise<any[] | null>;
}
declare const createSelasClient: (credentials: {
    app_id: string;
    key: string;
    secret: string;
}, worker_filter?: WorkerFilter) => Promise<SelasClient>;

export { Patch, PatchConfig, SelasClient, StableDiffusionConfig, WorkerFilter, createSelasClient };
