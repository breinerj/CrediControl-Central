// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {

  if (req.method === "OPTIONS") {

    return new Response("ok", {
      headers: corsHeaders
    });

  }
  try {

    const { email, password } = await req.json();

    const supabase = createClient(
      Deno.env.get("PROJECT_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    const { data, error } =
      await supabase.auth.admin.createUser({

        email,
        password,
        email_confirm: true

      });

    if (error) {

  /*
      Si el usuario ya existe,
      no devolvemos error fatal.
  */

  if (
      error.message &&
      error.message.includes(
          "already been registered"
      )
  ) {

      return new Response(
          JSON.stringify({

              ok: false,

              usuario_existente: true,

              error: error.message

          }),
          {
              headers: {
                  ...corsHeaders,
                  "Content-Type": "application/json"
              }
          }
      );

  }

  throw error;

}

    return new Response(
      JSON.stringify({
          ok: true,
          auth_user_id: data.user.id
      }),
      {
          headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
          }
      }
  );

  } catch (e) {

    return new Response(
      JSON.stringify({

        ok: false,
        error: e.message

      }),
      {
        status: 400,
        headers:{
          ...corsHeaders,
          "Content-Type":"application/json"
        }
      }
    );

  }
});/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/crear-admin-empresa' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
