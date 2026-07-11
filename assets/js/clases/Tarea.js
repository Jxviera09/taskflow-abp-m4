class Tarea {
    constructor(descripcion, fechaLimite = null) {
        this.id = crypto.randomUUID(); // Genera un ID único automático
        this.descripcion = descripcion;
        this.estado = false; // false -> Pendiente / true -> Finalizado
        this.fechaCreacion = moment().format('DD/MM/YYYY'); // Fecha formateada
        this.fechaLimite = fechaLimite; // Formato 'YYYY-MM-DD' o null (opcional)
    }

    // MÉTODO: cambia el estado de la tarea (Pendiente <-> Finalizado)
    cambiarEstado() {
        this.estado = !this.estado;
        return this.estado;
    }

    // MÉTODO ESTÁTICO: reconstruye una instancia de Tarea a partir de un
    // objeto plano. Es necesario al recuperar desde localStorage, porque
    // JSON.parse devuelve objetos sin métodos.
    static desdeObjeto(obj) {
        const tarea = new Tarea(obj.descripcion, obj.fechaLimite ?? null);
        tarea.id = obj.id;
        tarea.estado = obj.estado;
        tarea.fechaCreacion = obj.fechaCreacion;
        return tarea;
    }
};


export default Tarea;
