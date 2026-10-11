
import { downloadValidator } from "@/validators/download.validator";
import { rotateProvider } from "@/services/rotator";
import { NextRequest } from "next/server";
import { getProvider } from "tiktok-dl-core";

const corsHeaders = {
    "Access-Control-Allow-Origin": "https://clipstok.danielperez20077.workers.dev",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

const jsonResponse = (body: unknown, status = 200) =>
    Response.json(body, { status, headers: corsHeaders });

const handleRequest = async <T>(json: T) => {
    try {
        const safeData = await downloadValidator.safeParseAsync(json);

        if (!safeData.success) {
            return jsonResponse({
                errors: safeData.error,
                message: "Validation errors",
            }, 400);
        }

        const provider = getProvider(safeData.data.type);
        if (!provider) {
            return jsonResponse({ message: "Provider not found" }, 404);
        }

        const params = provider.getParams();
        if (params) {
            const safeDataParams = await params.safeParseAsync(safeData.data.params);
            if (!safeDataParams.success) {
                return jsonResponse({
                    errors: safeDataParams.error,
                    message: "Validation errors in params!",
                }, 400);
            }
        }

        const result = await rotateProvider(
            provider,
            safeData.data.url,
            safeData.data.rotateOnError,
            safeData.data.params
        );

        return jsonResponse({ data: result });
    } catch (e) {
        return jsonResponse({
            message: (e as Error).message,
        }, 500);
    }
};

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders,
    });
}

export async function GET(request: NextRequest) {
    const allParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    return handleRequest(allParams);
}

export async function POST(request: NextRequest) {
    try {
        const json = await request.json();
        return handleRequest(json);
    } catch (e) {
        return jsonResponse({
            message: (e as Error).message,
        }, 500);
    }
}
