
import { BaseProvider, Providers } from "tiktok-dl-core";

const corsHeaders = {
    "Access-Control-Allow-Origin": "https://clipstok.danielperez20077.workers.dev",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

const transformProvider = (provider: BaseProvider) => {
    const params = provider.getParams();

    return {
        name: provider.resourceName(),
        url: provider.client?.defaults.options.prefixUrl,
        maintenance: provider.maintenance,
        params: params ? Object.keys(params._zod.def.shape).map(k => ({
            name: k,
            type: params._zod.def.shape[k].def.type,
        })) : {},
    };
};

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders,
    });
}

export async function GET() {
    return Response.json(
        { data: Providers.map(transformProvider) },
        { headers: corsHeaders }
    );
}
