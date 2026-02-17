import OpenAI from 'openai'
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




// Handle POST request - AI Recommendations
export async function onRequestPost(context) {
    try {
        const openaiApiKey = getEnv('OPENAI_API_KEY', context);
        const supabaseUrl = getEnv('SUPABASE_URL', context) || getEnv('VITE_SUPABASE_URL', context);
        const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY', context) || getEnv('VITE_SUPABASE_ANON_KEY', context);

        if (!openaiApiKey || !supabaseUrl || !supabaseAnonKey) {
            return new Response(JSON.stringify({ error: 'Missing environment variables' }), {
                status: 500,
                headers: headers
            });
        }

        const openai = new OpenAI({ apiKey: openaiApiKey });
        const supabase = createClient(supabaseUrl, supabaseAnonKey);



        const requestData = await context.request.json()
        const { sme_profile } = requestData

        // Fetch available influencers from Supabase
        let query = supabase
            .from('influencers')
            .select('*, users(name, avatar_url)')
            .eq('is_available', true)

        if (sme_profile.niche) {
            query = query.eq('niche', sme_profile.niche)
        }

        if (sme_profile.budget) {
            query = query.lte('price_per_post', Number(sme_profile.budget))
        }

        const { data: influencers, error: dbError } = await query
            .order('avg_rating', { ascending: false })
            .limit(10)

        if (dbError) {
            throw new Error('Database error: ' + dbError.message)
        }

        // Build prompt for OpenAI
        const influencerList = influencers.map(inf => ({
            id: inf.id,
            name: inf.users?.name,
            niche: inf.niche,
            platform: inf.platform,
            followers: inf.followers_count,
            engagement_rate: inf.engagement_rate,
            price_per_post: inf.price_per_post,
            location: inf.location,
            rating: inf.avg_rating,
            total_orders: inf.total_orders,
        }))

        const prompt = `Anda adalah AI recommendation engine untuk platform NanoConnect.
Berdasarkan profil SME berikut:
- Nama Bisnis: ${sme_profile.business_name || 'N/A'}
- Niche: ${sme_profile.niche || 'N/A'}
- Budget: Rp ${sme_profile.budget || 'N/A'}
- Target Audience: ${sme_profile.target_audience || 'N/A'}
- Lokasi: ${sme_profile.location || 'N/A'}
- Tujuan Campaign: ${sme_profile.campaign_goal || 'N/A'}

Dan daftar influencer berikut:
${JSON.stringify(influencerList, null, 2)}

Berikan ranking top 5 influencer yang paling cocok beserta skor kecocokan (0-100) dan alasan singkat.
Response dalam format JSON array: [{"id": "...", "match_score": 95, "reason": "..."}]`

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 1000,
        })

        const aiResponse = completion.choices[0].message.content
        let rankings = []
        try {
            // Parse AI response - extract JSON from response
            const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
            if (jsonMatch) {
                rankings = JSON.parse(jsonMatch[0])
            }
        } catch (parseError) {
            console.error('Error parsing AI response:', parseError)
        }

        // Merge AI rankings with influencer data
        const recommendations = rankings.map(rank => {
            const inf = influencers.find(i => i.id === rank.id)
            if (inf) {
                return { ...inf, match_score: rank.match_score, ai_reason: rank.reason }
            }
            return null
        }).filter(Boolean)

        // If AI parsing failed, return default ranking
        if (recommendations.length === 0) {
            const defaultRecs = influencers.slice(0, 5).map((inf, i) => ({
                ...inf,
                match_score: Math.max(90 - (i * 8), 50),
                ai_reason: 'Cocok berdasarkan niche dan budget.'
            }))
            return new Response(JSON.stringify({ recommendations: defaultRecs }), {
                status: 200,
                headers: headers
            })
        }

        return new Response(JSON.stringify({ recommendations }), {
            status: 200,
            headers: headers
        })

    } catch (error) {
        console.error('AI Recommendation error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: headers
        })
    }
}

// Handle CORS preflight
export async function onRequestOptions() {
    return new Response(null, { status: 200, headers: headers })
}

// Handle GET request
export async function onRequestGet() {
    return new Response(JSON.stringify({ message: 'AI Recommendations API is running.' }), {
        status: 200,
        headers: headers
    })
}
