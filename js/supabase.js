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

supabaseClient.auth.getUser().then(({ data, error }) => {

    console.log("USUARIO AUTH:", data.user);

    console.log("ERROR AUTH:", error);

});

supabaseClient
    .from("empresas")
    .select("id,nombre")
    .then(resultado => {

        console.log("PRUEBA DIRECTA:", resultado);

    });