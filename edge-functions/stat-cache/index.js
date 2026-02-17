
import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export async function onRequest(context) {
  const req = context.request;

  // Ensure request is treated correctly
  // if (req.method === 'OPTIONS') { return new Response(JSON.stringify({status: 'ok'}), { headers: corsHeaders }) }

  try {
    // Helper to get environment variables across different runtimes
    const getEnv = (key) => {
      // Check context.env first (EdgeOne/Cloudflare standard)
      if (context.env && context.env[key]) return context.env[key];
      // Check Deno.env (Deno runtime)
      if (typeof Deno !== 'undefined' && Deno.env && Deno.env.get) return Deno.env.get(key);
      // Check process.env (Node runtime)
      if (typeof process !== 'undefined' && process.env) return process.env[key];
      return undefined;
    };

    // Coba ambil user dari token JWT untuk personalisasi cache key
    let userId = 'public';
    let userRole = 'anon';

    // Cek header Authorization
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      try {
        // Decode payload JWT tanpa verifikasi signature (verifikasi dilakukan oleh Supabase nanti)
        const parts = token.split('.');
        if (parts.length === 3) {
           const payload = JSON.parse(atob(parts[1]));
           userId = payload.sub || 'public';
           userRole = payload.role || 'anon';
        }
      } catch (e) {
        // Token invalid, fallback to public
      }
    }

    const CACHE_KEY = `dashboard_stats_${userId}`;

    // Coba ambil data dari KV Storage (jika ada binding STAT_CACHE_KV)
    const KV = context.env ? context.env.STAT_CACHE_KV : null;
    
    if (KV) {
      try {
        const cachedData = await KV.get(CACHE_KEY, { type: 'json' });
        if (cachedData) {
          return new Response(JSON.stringify(cachedData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache-Status': 'HIT', 'X-Cache-Key': CACHE_KEY },
            status: 200,
          });
        }
      } catch (err) {
        console.warn('KV Read Error:', err);
      }
    }

    const supabaseUrl = getEnv('SUPABASE_URL');
    const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
      return new Response(JSON.stringify({
        stats: { influencers: 500, smes: 1200, campaigns: 5000, satisfaction: 98 },
        topInfluencers: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    )

    // Query bisa disesuaikan berdasarkan userId atau role jika perlu
    // Contoh: jika SME login, mungkin stats personal yang ditampilkan
    
    const [{ count: infCount }, { count: smeCount }, { count: orderCount }] = await Promise.all([
      supabaseClient.from('influencers').select('*', { count: 'exact', head: true }),
      supabaseClient.from('users').select('*', { count: 'exact', head: true }).eq('user_type', 'sme'),
      supabaseClient.from('orders').select('*', { count: 'exact', head: true }),
    ])

    const { data: topInfluencers } = await supabaseClient
      .from('influencers')
      .select('*, users(name, avatar_url)')
      .eq('is_available', true)
      .order('avg_rating', { ascending: false })
      .limit(4)

    const data = {
      stats: {
        influencers: infCount || 0,
        smes: smeCount || 0,
        campaigns: orderCount || 0,
        satisfaction: 98
      },
      topInfluencers: topInfluencers || [],
      personalized: userId !== 'public' // Flag untuk debug di frontend
    }

    // Simpan ke KV Storage selama 5 menit (300 detik)
    if (KV) {
      try {
        // Gunakan context.waitUntil jika tersedia agar tidak memblokir response
        const promise = KV.put(CACHE_KEY, JSON.stringify(data), { expirationTtl: 300 });
        if (context.waitUntil) {
          context.waitUntil(promise);
        } else {
          await promise;
        }
      } catch (err) {
        console.warn('KV Write Error:', err);
      }
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache-Status': 'MISS', 'X-Cache-Key': CACHE_KEY },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}