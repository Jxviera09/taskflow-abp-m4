import GestorTareas from "./clases/GestorTareas.js";

const gestorTareas = new GestorTareas();

// Helper asíncrono: devuelve una promesa que se resuelve tras "ms" milisegundos
const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const crearFilaTabla = (tarea) => {
    const { id, descripcion, estado, fechaCreacion, fechaLimite } = tarea;

    const estadoStr = estado ? "Finalizado" : "Pendiente";
    const disabled = estado ? "disabled" : "";
    const badge = estado ? "success" : "warning";

    // Si la tarea tiene fecha límite y sigue pendiente, mostramos un contador
    const celdaLimite =
        fechaLimite && !estado
            ? `<span class="badge text-bg-info" data-fecha-limite="${fechaLimite}">...</span>`
            : "-";

    return `
        <tr>
            <th scope="row">${id}</th>
            <td>${descripcion}</td>
            <td>
                <span class="badge rounded-pill text-bg-${badge}">${estadoStr}</span>
            </td>
            <td>${fechaCreacion}</td>
            <td>${celdaLimite}</td>
            <td>
                <button class="btn btn-warning btn-finalizar ${disabled}" data-id="${id}">Finalizar</button>
                <button class="btn btn-danger btn-eliminar" data-id="${id}">Eliminar</button>
            </td>
        </tr>
    `;
};


const statsTareas = () => {
    document.getElementById("stat-totales").textContent = gestorTareas.cantidadTareas();
    document.getElementById("stat-finalizadas").textContent = gestorTareas.cantidadTareasFinalizadas();
    document.getElementById("stat-pendientes").textContent = gestorTareas.cantidadTareasPendientes();
}

const alertSinTareas = document.getElementById("alert-sin-tareas");
const tablaTareas = document.getElementById("tabla-tareas");

const cargarTareasTabla = (listaTareas = []) => {
    statsTareas();
    if (listaTareas.length == 0){

        alertSinTareas.classList.remove("d-none");
        tablaTareas.classList.add("d-none");

        return;
    }

    let acumuladorFilas = "";
    for (const tarea of listaTareas) {
        acumuladorFilas += crearFilaTabla(tarea);
    }

    const cuerpoTabla = document.querySelector("#tabla-tareas tbody");

    cuerpoTabla.innerHTML = acumuladorFilas;

    alertSinTareas.classList.add("d-none");
    tablaTareas.classList.remove("d-none");

    actualizarContadores(); // pintamos los contadores de inmediato
};

const actualizarTabla = async () => {
    const tareas = await gestorTareas.obtenerTareas();
    cargarTareasTabla(tareas);
}

const main = () => {
    actualizarTabla();
};

main();

// ---------------------------------------------------------------------------
// NOTIFICACIONES (asincronía + spread/rest)
// ---------------------------------------------------------------------------

const contenedorNotificaciones = document.getElementById("contenedor-notificaciones");

// Usa rest (...mensajes) para aceptar cualquier cantidad de partes de texto
const mostrarNotificacion = (tipo, ...mensajes) => {
    const texto = mensajes.join(" ");

    const notificacion = document.createElement("div");
    notificacion.className = `alert alert-${tipo} shadow`;
    notificacion.setAttribute("role", "alert");
    notificacion.textContent = texto;

    contenedorNotificaciones.appendChild(notificacion);

    // La notificación desaparece automáticamente tras 3 segundos
    setTimeout(() => notificacion.remove(), 3000);
};

// ---------------------------------------------------------------------------
// CONTADOR REGRESIVO para tareas con fecha límite (setInterval)
// ---------------------------------------------------------------------------

const actualizarContadores = () => {
    const contadores = document.querySelectorAll("[data-fecha-limite]");

    contadores.forEach((span) => {
        const limite = span.dataset.fechaLimite;
        const fin = moment(limite, "YYYY-MM-DD").endOf("day");
        const diferencia = fin.diff(moment());

        if (diferencia <= 0) {
            span.textContent = "¡Vencida!";
            span.className = "badge text-bg-danger";
            return;
        }

        const duracion = moment.duration(diferencia);
        const dias = Math.floor(duracion.asDays());
        span.textContent = `${dias}d ${duracion.hours()}h ${duracion.minutes()}m ${duracion.seconds()}s`;
    });
};

setInterval(actualizarContadores, 1000);

// ---------------------------------------------------------------------------
// EVENTO KEYUP: contador de caracteres en vivo
// ---------------------------------------------------------------------------

const inputDescripcion = document.getElementById("input-descripcion-tarea");
const contadorCaracteres = document.getElementById("contador-caracteres");

const actualizarContadorCaracteres = () => {
    contadorCaracteres.textContent = `${inputDescripcion.value.length} caracteres`;
};

inputDescripcion.addEventListener("keyup", actualizarContadorCaracteres);

// ---------------------------------------------------------------------------
// EVENTO FORMULARIO ADD TAREA (con retardo simulado y notificación)
// ---------------------------------------------------------------------------

const formAddTarea = document.getElementById("form-add-tarea");

formAddTarea.addEventListener("submit", async (event) => {
    event.preventDefault();

    const boton = formAddTarea.querySelector("button[type=submit]");

    try {
        const descripcion = document.getElementById("input-descripcion-tarea").value;
        const fechaLimite = document.getElementById("input-fecha-limite").value || null;

        // Simulamos un retardo al agregar la tarea (asincronía)
        boton.disabled = true;
        boton.textContent = "Agregando...";
        await esperar(1000);

        const tarea = await gestorTareas.crearTarea(descripcion, fechaLimite);

        // AL TERMINAR DE CREAR UNA TAREA ACTUALIZAMOS LAS TAREAS EN LA TABLA
        await actualizarTabla();

        // LIMPIAMOS EL FORMULARIO
        formAddTarea.reset();
        actualizarContadorCaracteres();

        // Mostramos una notificación 2 segundos después de agregar
        setTimeout(() => {
            mostrarNotificacion("success", "Tarea", `"${tarea.descripcion}"`, "agregada correctamente");
        }, 2000);
    } catch (error) {
        mostrarNotificacion("danger", error.message);
        console.error(error);
    } finally {
        boton.disabled = false;
        boton.textContent = "Agregar Tarea";
    }
});

// ---------------------------------------------------------------------------
// EVENTOS SOBRE LA TABLA (finalizar, eliminar y mouseover)
// ---------------------------------------------------------------------------

const cuerpoTabla = document.querySelector("#tabla-tareas tbody");

// EVENTO MOUSEOVER: resalta la fila sobre la que se pasa el cursor
cuerpoTabla.addEventListener("mouseover", (event) => {
    const fila = event.target.closest("tr");
    if (!fila) return;

    cuerpoTabla.querySelectorAll("tr").forEach((tr) => tr.classList.remove("fila-activa"));
    fila.classList.add("fila-activa");
});

// EVENTO FINALIZAR TAREA
cuerpoTabla.addEventListener("click", (event) => {
    const elemento = event.target;

    if (elemento.nodeName == "BUTTON" && elemento.className.includes("btn-finalizar")){

        const confirmacion = confirm("¿Está seguro que desea finalizar la tarea?");

        if(!confirmacion) return;

        const id = elemento.dataset.id;

        const tarea = gestorTareas.finalizarTarea(id);

        mostrarNotificacion("success", `La tarea "${tarea.descripcion}" ha finalizado con éxito!`);

        actualizarTabla();
    }
});

// EVENTO ELIMINAR TAREA
cuerpoTabla.addEventListener("click", (event) => {
    const elemento = event.target;

    if (elemento.nodeName == "BUTTON" && elemento.className.includes("btn-eliminar")){

        const id = elemento.dataset.id;
        const tarea = gestorTareas.obtenerTareaPorId(id);

        const confirmacion = confirm(`¿Está seguro que desea eliminar la tarea: '${tarea.descripcion}'?`);

        if(!confirmacion) return;

        const respuesta = gestorTareas.eliminarTarea(id);

        if(respuesta) mostrarNotificacion("warning", `Tarea "${tarea.descripcion}" eliminada con éxito.`);

        actualizarTabla();
    }
});
