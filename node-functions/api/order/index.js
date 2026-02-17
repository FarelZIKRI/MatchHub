import { createClient } from '@supabase/supabase-js'

const headers = {
    'Content-Type':'application/json',
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type, Authorization'
}

// Helper to get environment variables across different runtimes
const getEnv = (key, context) => {
    // Check context.env first (EdgeOne/Cloudflare standard)
    if (context && context.env && context.env[key]) return context.env[key];
    // Check process.env (Node runtime)
    if (typeof process !== 'undefined' && process.env) return process.env[key];
    return undefined;
};


// Handle POST request - Create Order
export async function onRequestPost(context){
    const supabaseUrl = getEnv('SUPABASE_URL', context) || getEnv('VITE_SUPABASE_URL', context);
    const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY', context) || getEnv('VITE_SUPABASE_ANON_KEY', context);

    if (!supabaseUrl || !supabaseAnonKey) {
        return new Response(JSON.stringify({ error: 'Missing environment variables' }), {
            status: 500,
            headers: headers
        });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const orderData = await context.request.json()
    console.log('Order data received:', orderData)

    if(!orderData.influencer_id || !orderData.sme_id){
        return new Response(JSON.stringify({error: 'Invalid Order Data.'}),{
        status: 400,
        headers: headers
    });
    }

    const {data, error} = await supabase
    .from('orders')
    .insert([orderData])
    .select()

    if(error){
        return new Response(JSON.stringify({error: error.message}),{
            status: 500,
            headers: headers
        });
    }

    return new Response(JSON.stringify({order:data[0]}),{
        status: 201,
        headers: headers
    });
}

// Handle CORS preflight
export async function onRequestOptions(){
    return new Response(null,{status: 200, headers: headers})
}

// Handle GET request
export async function onRequestGet(context){
    return new Response(JSON.stringify({message: 'Order API is running.'}),{
        status: 200,
        headers: headers
    })
}
