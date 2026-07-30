/*=========================================================
    CREDICONTROL CENTRAL
    PANEL SUPERADMIN
=========================================================*/
/*=========================================================
    LOGIN SUPERADMIN
=========================================================*/

async function iniciarSesion(){

    const email =
        document
        .getElementById("loginEmail")
        .value
        .trim();


    const password =
        document
        .getElementById("loginPassword")
        .value;


    const mensaje =
        document.getElementById(
            "mensajeLogin"
        );


    mensaje.classList.add(
        "d-none"
    );


    if(!email || !password){

        mensaje.textContent =
            "Ingresa tu correo y contraseña.";

        mensaje.classList.remove(
            "d-none"
        );

        return;

    }


    const {
        data,
        error
    } =
    await supabaseClient.auth
        .signInWithPassword({

            email: email,

            password: password

        });


    if(error){

        console.error(
            "Error de acceso:",
            error
        );


        mensaje.textContent =
            "Correo o contraseña incorrectos.";


        mensaje.classList.remove(
            "d-none"
        );


        return;

    }


    console.log(
        "Sesión iniciada:",
        data.user
    );


    await mostrarPanel(
        data.user
    );

}



/*=========================================================
    MOSTRAR PANEL
=========================================================*/

async function mostrarPanel(
    usuario
){

    document
        .getElementById(
            "pantallaLogin"
        )
        .classList
        .add(
            "d-none"
        );


    document
        .getElementById(
            "panelCentral"
        )
        .classList
        .remove(
            "d-none"
        );


    document
        .getElementById(
            "usuarioActual"
        )
        .textContent =
            usuario.email;


    await cargarDashboard();

}



/*=========================================================
    CERRAR SESION
=========================================================*/

async function cerrarSesion(){

    await supabaseClient.auth
        .signOut();


    document
        .getElementById(
            "panelCentral"
        )
        .classList
        .add(
            "d-none"
        );


    document
        .getElementById(
            "pantallaLogin"
        )
        .classList
        .remove(
            "d-none"
        );


    document
        .getElementById(
            "loginPassword"
        )
        .value = "";

}



/*=========================================================
    VERIFICAR SESION AL ABRIR
=========================================================*/

async function verificarSesion(){

    const {
        data
    } =
    await supabaseClient.auth
        .getSession();


    if(
        data.session &&
        data.session.user
    ){

        await mostrarPanel(
            data.session.user
        );

    }

}


document.addEventListener(
    "DOMContentLoaded",
    verificarSesion
);

/*=========================================================
    INICIAR PANEL
=========================================================*/




async function iniciarPanel(){

    await probarConexion();

    await cargarDashboard();

}


/*=========================================================
    PROBAR CONEXION
=========================================================*/

async function probarConexion(){

    const estado =
        document.getElementById(
            "estadoConexion"
        );


    const {
        data,
        error
    } =
    await supabaseClient
        .from("empresas")
        .select("id")
        .limit(1);


    if(error){

        console.error(
            "Error Supabase:",
            error
        );


        estado.className =
            "alert alert-danger";


        estado.textContent =
            "No se pudo conectar con CrediControl Central.";


        return false;

    }


    estado.className =
        "alert alert-success";


    estado.textContent =
        "Conexión correcta con CrediControl Central.";


    return true;

}


/*=========================================================
    CARGAR DASHBOARD
=========================================================*/

async function cargarDashboard(){

    await cargarEmpresas();

    await cargarSolicitudes();

}


/*=========================================================
    CARGAR EMPRESAS
=========================================================*/

async function cargarEmpresas(){

    const tabla =
        document.getElementById(
            "tablaEmpresas"
        );


    const {
        data,
        error
    } =
    await supabaseClient
        .from("empresas")
        .select(`
            *,
            licencias(
                fecha_fin,
                estado,
                planes(nombre)
            )
        `)
        .order(
            "id",
            {
                ascending: true
            }
        );


    if(error){

        console.error(
            "Error cargando empresas:",
            error
        );

        return;

    }


    tabla.innerHTML = "";


    let totalCupos = 0;


    data.forEach(

        empresa => {

            const cupos =
                empresa.cupos_cobradores || 0;

            totalCupos += cupos;


            let plan = "-";
            let vence = "-";

            if(
                empresa.licencias &&
                empresa.licencias.length > 0
            ){

                const licencia =
                    empresa.licencias[0];

                plan =
                    licencia.planes?.nombre || "-";

                vence =
                    licencia.fecha_fin || "-";

            }


            tabla.innerHTML += `

                <tr>

                    <td>

                        ${empresa.codigo_empresa || ""}

                    </td>

                    <td>

                        ${empresa.nombre || ""}

                    </td>

                    <td>

                        ${plan}

                    </td>

                    <td>

                        <span class="badge bg-success">

                            ${empresa.estado || ""}

                        </span>

                    </td>

                    <td>

                        ${vence}

                    </td>

                    <td>

                        ${cupos}

                    </td>

                    <td>

                        <button
                            class="btn btn-sm btn-primary"
                            onclick="editarEmpresa(${empresa.id})">

                            Editar

                        </button>

                    </td>

                </tr>

            `;

        }

    );


    document.getElementById(
        "totalEmpresas"
    ).textContent =
        data.length;


    document.getElementById(
        "totalCupos"
    ).textContent =
        totalCupos;


    if(data.length === 0){

        tabla.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center text-muted"
                >

                    No hay empresas registradas.

                </td>

            </tr>

        `;

    }

}


/*=========================================================
    CARGAR SOLICITUDES PENDIENTES
=========================================================*/

async function cargarSolicitudes(){

    const tabla =
        document.getElementById(
            "tablaSolicitudes"
        );


    const {
        data,
        error
    } =
    await supabaseClient
        .from("solicitudes_cupos")
        .select(`
            id,
            empresa_id,
            cantidad,
            estado,
            fecha_solicitud
        `)
        .eq(
            "estado",
            "PENDIENTE"
        )
        .order(
            "fecha_solicitud",
            {
                ascending: false
            }
        );


    if(error){

        console.error(
            "Error cargando solicitudes:",
            error
        );

        return;

    }


    tabla.innerHTML = "";


    document.getElementById(
        "totalPendientes"
    ).textContent =
        data.length;


    if(data.length === 0){

        tabla.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="text-center text-muted"
                >

                    No hay solicitudes pendientes.

                </td>

            </tr>

        `;


        return;

    }


    for(
        const solicitud
        of data
    ){

        const empresa =
            await obtenerEmpresa(
                solicitud.empresa_id
            );


        const nombreEmpresa =
            empresa
            ? empresa.nombre
            : "Empresa no encontrada";


        const fecha =
            solicitud.fecha_solicitud

            ? new Date(
                solicitud.fecha_solicitud
            ).toLocaleString()

            : "";


        tabla.innerHTML += `

            <tr>

                <td>

                    ${solicitud.id}

                </td>


                <td>

                    ${nombreEmpresa}

                </td>


                <td>

                    ${solicitud.cantidad}

                </td>


                <td>

                    ${fecha}

                </td>


                <td>

                    <span class="badge bg-warning text-dark">

                        ${solicitud.estado}

                    </span>

                </td>


                <td>

                    <button
                        class="btn btn-success btn-sm"
                        onclick="aprobarSolicitud(
                            ${solicitud.id}
                        )"
                    >

                        Aprobar

                    </button>


                    <button
                        class="btn btn-danger btn-sm"
                        onclick="rechazarSolicitud(
                            ${solicitud.id}
                        )"
                    >

                        Rechazar

                    </button>

                </td>

            </tr>

        `;

    }

}


/*=========================================================
    OBTENER EMPRESA
=========================================================*/

async function obtenerEmpresa(
    empresaId
){

    const {
        data,
        error
    } =
    await supabaseClient
        .from("empresas")
        .select(
            "id,nombre"
        )
        .eq(
            "id",
            empresaId
        )
        .single();


    if(error){

        console.error(
            "Error obteniendo empresa:",
            error
        );


        return null;

    }


    return data;

}


/*=========================================================
    APROBAR SOLICITUD
=========================================================*/

async function aprobarSolicitud(
    solicitudId
){

    console.log(
    "ID solicitud que se intenta aprobar:",
    solicitudId
);

    const confirmar =
        confirm(
            "¿Deseas aprobar esta solicitud de cupo?"
        );


    if(!confirmar){

        return;

    }


    const {
        error
    } =
    await supabaseClient
        .rpc(
            "aprobar_solicitud_cupo",
            {
                p_solicitud_id:
                    solicitudId
            }
        );


    if(error){

        console.error(
            "Error aprobando solicitud:",
            error
        );


        alert(
            "No se pudo aprobar la solicitud."
        );


        return;

    }


    alert(
        "Solicitud aprobada correctamente."
    );


    await cargarDashboard();

}


/*=========================================================
    RECHAZAR SOLICITUD
=========================================================*/

async function rechazarSolicitud(
    solicitudId
){

    const confirmar =
        confirm(
            "¿Deseas rechazar esta solicitud de cupo?"
        );


    if(!confirmar){

        return;

    }


    const {
        error
    } =
    await supabaseClient
        .rpc(
            "rechazar_solicitud_cupo",
            {
                p_solicitud_id:
                    solicitudId
            }
        );


    if(error){

        console.error(
            "Error rechazando solicitud:",
            error
        );


        alert(
            "No se pudo rechazar la solicitud."
        );


        return;

    }


    alert(
        "Solicitud rechazada correctamente."
    );


    await cargarDashboard();

}

/*=========================================================
    MODAL NUEVA EMPRESA
=========================================================*/

const modalEmpresa = new bootstrap.Modal(
    document.getElementById("modalEmpresa")
);

const btnNuevaEmpresa =
    document.getElementById("btnNuevaEmpresa");

if (btnNuevaEmpresa) {

    btnNuevaEmpresa.addEventListener("click", async () => {

        // Ya no estamos editando
        empresaEditando = null;

        // El botón vuelve a decir Guardar
        document.getElementById(
            "btnGuardarEmpresa"
        ).textContent = "Guardar";

        // Limpiar todos los campos
        document.getElementById("empresaNombre").value = "";
        document.getElementById("empresaNit").value = "";
        document.getElementById("empresaCorreo").value = "";
        document.getElementById("empresaTelefono").value = "";
        document.getElementById("empresaPlan").value = "";

        // Cargar nuevamente los planes
        await cargarPlanes();

        // Mostrar el modal
        modalEmpresa.show();

    });

}


/*=========================================================
    EDICION EMPRESA
=========================================================*/

let empresaEditando = null;


/*=========================================================
    CARGAR PLANES
=========================================================*/

async function cargarPlanes() {

    const combo =
        document.getElementById("empresaPlan");

    combo.innerHTML = "";

    const {
        data,
        error
    } = await supabaseClient

        .from("planes")

        .select("*")

        .eq("activo", true)

        .order("nombre");


    if (error) {

        console.error(error);

        return;

    }


    combo.innerHTML =
        '<option value="">Seleccione...</option>';

    data.forEach(plan => {

        combo.innerHTML += `

            <option value="${plan.id}">

                ${plan.nombre}

            </option>

        `;

    });
}

/*=========================================================
    GUARDAR EMPRESA
=========================================================*/

const btnGuardarEmpresa =
    document.getElementById(
        "btnGuardarEmpresa"
    );

if(btnGuardarEmpresa){

    btnGuardarEmpresa.addEventListener(
        "click",
        guardarEmpresa
    );

}

async function guardarEmpresa(){

    if(empresaEditando){

        return actualizarEmpresa();

}

    const nombre =
        document.getElementById("empresaNombre").value.trim();

    const nit =
        document.getElementById("empresaNit").value.trim();

    const correo =
        document.getElementById("empresaCorreo").value.trim();

    const telefono =
        document.getElementById("empresaTelefono").value.trim();

    const plan =
        document.getElementById("empresaPlan").value;


    if(nombre===""){

        alert("Debe ingresar el nombre de la empresa.");

        return;

    }

    if(plan===""){

        alert("Debe seleccionar un plan.");

        return;

    }


    const {

        data,

        error

    } = await supabaseClient.rpc(

        "crear_empresa",

        {

            p_nombre: nombre,

            p_nit: nit,

            p_correo: correo,

            p_telefono: telefono,

            p_plan_id: Number(plan)

        }

    );


    if(error){

    console.error(error);

    alert(error.message);

    return;

}

// data contiene el empresa_id que devuelve el RPC
const empresaId = data;

// Crear usuario administrador en Auth
const respuesta = await fetch(
    "https://npyjlamyfbrnxfudtbcd.supabase.co/functions/v1/crear-admin-empresa",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_PUBLIC_KEY,
            "Authorization": `Bearer ${SUPABASE_PUBLIC_KEY}`
        },
        body: JSON.stringify({
            email: correo,
            password: "Admin12345*"
        })
    }
);

if (!respuesta.ok) {

    const errorTexto = await respuesta.text();

    console.error(errorTexto);

    alert("Error al crear el usuario administrador.");

    return;

}

const resultado = await respuesta.json();

if(!resultado.ok){

    console.error(resultado);

    alert("La empresa fue creada, pero no se pudo crear el usuario administrador.");

    return;

}

// Registrar administrador de la empresa
const { error: errorUsuario } = await supabaseClient
    .from("usuarios_empresa")
    .insert({
        auth_user_id: resultado.auth_user_id,
        empresa_id: empresaId,
        nombre: nombre,
        correo: correo,
        rol: "ADMIN",
        estado: "ACTIVO"
    });

if(errorUsuario){

    console.error("ERROR usuarios_empresa:", errorUsuario);

    alert(
        "La empresa fue creada, pero no se pudo registrar el administrador.\n\n" +
        JSON.stringify(errorUsuario, null, 2)
    );

    return;

}

modalEmpresa.hide();

document.getElementById("empresaNombre").value="";
document.getElementById("empresaNit").value="";
document.getElementById("empresaCorreo").value="";
document.getElementById("empresaTelefono").value="";
document.getElementById("empresaPlan").value="";

await cargarEmpresas();

alert(
`Empresa creada correctamente.

Usuario: ${correo}

Contraseña temporal: Admin12345*`
);
}

/*=========================================================
    ACTUALIZAR EMPRESA
=========================================================*/

async function actualizarEmpresa(){

    const nombre =
        document.getElementById("empresaNombre").value.trim();

    const nit =
        document.getElementById("empresaNit").value.trim();

    const correo =
        document.getElementById("empresaCorreo").value.trim();

    const telefono =
        document.getElementById("empresaTelefono").value.trim();

    const plan =
        Number(
            document.getElementById("empresaPlan").value
        );

    const {
        error
    } =
    await supabaseClient
    .from("empresas")
    .update({

        nombre:nombre,

        nit:nit,

        correo:correo,

        telefono:telefono,

        plan_id:plan

    })
    .eq(
        "id",
        empresaEditando
    );

    if(error){

        console.error(error);

        alert(
            "No se pudo actualizar."
        );

        return;

    }

    empresaEditando=null;

    document.getElementById(
        "btnGuardarEmpresa"
    ).textContent="Guardar";

    modalEmpresa.hide();

    await cargarEmpresas();

    alert(
        "Empresa actualizada correctamente."
    );

}


/*=========================================================
    EDITAR EMPRESA
=========================================================*/

async function editarEmpresa(id){

    const {
        data,
        error
    } =
    await supabaseClient
        .from("empresas")
        .select("*")
        .eq("id", id)
        .single();

    if(error){

        console.error(error);

        alert("No se pudo cargar la empresa.");

        return;

    }

    empresaEditando = id;

    await cargarPlanes();

    document.getElementById("tituloModalEmpresa").textContent =
        "Editar Empresa";

    document.getElementById("btnGuardarEmpresa").textContent =
        "Actualizar Empresa";

    document.getElementById("empresaNombre").value =
        data.nombre || "";

    document.getElementById("empresaNit").value =
        data.nit || "";

    document.getElementById("empresaCorreo").value =
        data.correo || "";

    document.getElementById("empresaTelefono").value =
        data.telefono || "";

    // Lo dejamos comentado por ahora
    // hasta revisar cómo manejas los planes
    // document.getElementById("empresaPlan").value =
    //     data.plan_id || "";

    modalEmpresa.show();

}