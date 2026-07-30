const SUPABASE_URL =
    "https://npyjlamyfbrnxfudtbcd.supabase.co";

const SUPABASE_PUBLIC_KEY =
    "sb_publishable_QeMGBYXdta_lt-cFffqmDQ_bNQeJV3u";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLIC_KEY,
        {
            auth: {
                storageKey: "credicontrol_central_auth",
                persistSession: true,
                autoRefreshToken: true
            }
        }
    );

console.log(
    "CrediControl Central conectado a Supabase"
);