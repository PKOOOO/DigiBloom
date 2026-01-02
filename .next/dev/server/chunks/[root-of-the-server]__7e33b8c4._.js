module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/lib/supabase.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://njucmlalipivxctqxnvh.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "sb_publishable_23IqEIrHo8gPMqWYC8HlRg_M1znUgWD");
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
}),
"[project]/lib/flower-data.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FLOWER_METADATA",
    ()=>FLOWER_METADATA,
    "generateSlug",
    ()=>generateSlug
]);
const FLOWER_METADATA = {
    'red-tulip': {
        name: 'Red Tulip',
        description: 'Chosen to express love and passion.',
        tags: [
            'Passionate',
            'Bold',
            'Romantic'
        ],
        image: '/tulip.png'
    },
    'white-rose': {
        name: 'White Rose',
        description: 'A symbol of purity and remembrance.',
        tags: [
            'Pure',
            'Serene',
            'Timeless'
        ],
        image: '/rose.png'
    },
    'yellow-sunflower': {
        name: 'Sunflower',
        description: 'Represents warmth, joy, and loyalty.',
        tags: [
            'Radiant',
            'Cheerful',
            'Loyal'
        ],
        image: '/sunflower.png'
    },
    'pink-carnation': {
        name: 'Carnation',
        description: 'Given to show admiration and gratitude.',
        tags: [
            'Sweet',
            'Grateful',
            'Gentle'
        ],
        image: '/carnation.png'
    },
    'blue-forget-me-not': {
        name: 'Forget-Me-Not',
        description: 'A promise of lasting memory and connection.',
        tags: [
            'Dreamy',
            'Eternal',
            'Remembered'
        ],
        image: '/fmn.png'
    },
    'orange-lily': {
        name: 'Orange Lily',
        description: 'A symbol of confidence, pride, and wealth.',
        tags: [
            'Vibrant',
            'Confident',
            'Energetic'
        ],
        image: '/lily.png'
    }
};
function generateSlug(title) {
    const baseSlug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .slice(0, 50); // Truncate to max 50 characters
    // Append short UUID to ensure uniqueness while keeping slugs pretty
    const uniqueId = crypto.randomUUID().split('-')[0]; // First 8 chars of UUID
    return `${baseSlug}-${uniqueId}`;
}
}),
"[project]/app/api/flowers/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$flower$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/flower-data.ts [app-route] (ecmascript)");
;
;
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const minX = searchParams.get('minX');
    const maxX = searchParams.get('maxX');
    let query = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('flowers').select('*');
    if (minX) query = query.gte('x', parseInt(minX));
    if (maxX) query = query.lte('x', parseInt(maxX));
    const { data, error } = await query;
    if (error) {
        return Response.json({
            error: error.message
        }, {
            status: 500
        });
    }
    return Response.json(data);
}
async function POST(request) {
    try {
        const body = await request.json();
        const { title, message, author, x, y, flower } = body;
        // Validation
        if (!title || !message || x === undefined || y === undefined || !flower) {
            return Response.json({
                error: 'Missing required fields'
            }, {
                status: 400
            });
        }
        // Generate slug from title
        const slug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$flower$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateSlug"])(title);
        const insertData = {
            title,
            slug,
            message,
            author: author || null,
            x: Math.round(x),
            y: Math.round(y),
            flower
        };
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('flowers').insert(insertData).select().single();
        if (error) {
            console.error('Supabase error:', error);
            return Response.json({
                error: error.message
            }, {
                status: 500
            });
        }
        return Response.json(data);
    } catch (err) {
        console.error('POST /api/flowers error:', err);
        return Response.json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7e33b8c4._.js.map