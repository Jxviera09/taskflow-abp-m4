import Tarea from "./Tarea.js";

// READ desde la API externa: obtiene tareas y las convierte en instancias de Tarea
const getDataApi = async (limit = 5) => {
    try {
        const url = `https://jsonplaceholder.typicode.com/todos?_limit=${limit}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const data = await response.json();

        const tareas = data.map((tarea) => {
            const objTarea = new Tarea(tarea.title);
            objTarea.estado = tarea.completed;
            return objTarea;
        });

        return tareas;
    } catch (error) {
        console.error("Error al obtener tareas de la API:", error);
        return [];
    }
};

// CREATE en la API externa: guarda una tarea mediante una petición POST
const guardarEnApi = async (tarea) => {
    try {
        const url = "https://jsonplaceholder.typicode.com/todos";
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: tarea.descripcion,
                completed: tarea.estado,
            }),
        });

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const data = await response.json();
        console.log("Tarea guardada en la API:", data);
        return data;
    } catch (error) {
        console.error("No se pudo guardar la tarea en la API:", error);
        return null;
    }
};


class GestorTareas {
    constructor() {
        this.tareas = []; // Almacenamiento temporal en memoria
    }

    // CREATE: Agregar una nueva tarea
    async crearTarea(descripcion, fechaLimite = null) {
        if (!descripcion || descripcion.trim() === "") {
            throw new Error("La descripción no puede estar vacía.");
        }

        const nuevaTarea = new Tarea(descripcion, fechaLimite);
        this.tareas.push(nuevaTarea);
        this.#guardarEnStorage();

        // Además de localStorage, guardamos la tarea en una API externa
        await guardarEnApi(nuevaTarea);

        return nuevaTarea;
    }

    // READ: Obtener todas las tareas o una específica por ID
    async obtenerTareas() {
        await this.#leerDeStorage();
        return [...this.tareas].reverse(); // spread: copiamos sin mutar el original
    }

    obtenerTareaPorId(id) {
        return this.tareas.find((tarea) => tarea.id === id) || null;
    }

    // UPDATE: cambiar el estado de la tarea
    finalizarTarea(id) {
        const tarea = this.obtenerTareaPorId(id);

        if (!tarea) {
            throw new Error("No existe la tarea que desea actualizar.");
        }

        tarea.cambiarEstado(); // usamos el método de la clase Tarea
        this.#guardarEnStorage();
        return tarea;
    }

    // DELETE: Eliminar una tarea por ID
    eliminarTarea(id) {
        const indice = this.tareas.findIndex((tarea) => tarea.id === id);

        if (indice === -1) {
            throw new Error("No existe la tarea que desea eliminar.");
        }

        this.tareas.splice(indice, 1);
        this.#guardarEnStorage();
        return true;
    }

    //FUNCIONES PRIVADAS PARA GESTIONAR ALMACENAMIENTO EN localStorage (API WEB)

    #guardarEnStorage() {
        localStorage.setItem("tareas", JSON.stringify(this.tareas));
    }

    async #leerDeStorage() {
        const tareas = localStorage.getItem("tareas");

        if (tareas) {
            // Rehidratamos a instancias de Tarea para conservar sus métodos.
            // Descartamos datos corruptos o de versiones antiguas (sin id/descripcion).
            const validas = JSON.parse(tareas)
                .filter((obj) => obj && obj.id && obj.descripcion)
                .map((obj) => Tarea.desdeObjeto(obj));

            this.tareas = validas.length ? validas : await getDataApi(15);
        } else {
            this.tareas = await getDataApi(15);
        }
    }

    //FUNCIONES STATS

    cantidadTareas(){
        return this.tareas.length;
    }

    cantidadTareasFinalizadas(){

        return this.tareas.filter(tarea => tarea.estado).length;
    }

    cantidadTareasPendientes(){
        return this.tareas.filter(tarea => !tarea.estado).length;
    }

}

export default GestorTareas;
