# TaskFlow — Aplicación de Gestión de Tareas 📝

Aplicación web interactiva para gestionar tareas (crear, finalizar y eliminar),
desarrollada con **JavaScript moderno (ES6+)**. Proyecto de evaluación del Módulo 4
*Programación Avanzada en JavaScript* (Alkemy).

## 🚀 Funcionalidades

- **CRUD de tareas**: crear, finalizar y eliminar.
- **Estadísticas** en vivo: totales, finalizadas y pendientes.
- **Fecha límite opcional** con **contador regresivo** que se actualiza cada segundo.
- **Notificaciones** dinámicas al agregar/finalizar/eliminar.
- **Persistencia** en `localStorage` (los datos se conservan al recargar).
- **Consumo de API** externa (JSONPlaceholder) para obtener y guardar tareas.

## 🛠️ Tecnologías

- JavaScript ES6+ (módulos, clases, arrow functions, template literals, destructuring, spread/rest)
- Bootstrap 5 (estilos)
- Moment.js (formato de fechas)
- Fetch API + async/await
- Web Storage API (`localStorage`)

## 📂 Estructura

```
abp-m4-todolist/
├── index.html
└── assets/
    ├── css/
    │   └── style.css
    └── js/
        ├── script.js            # Lógica de UI, eventos y DOM
        └── clases/
            ├── Tarea.js         # Clase Tarea (modelo)
            └── GestorTareas.js  # Clase GestorTareas (administra la lista + API + storage)
```

## ▶️ Cómo ejecutarlo

Como usa **módulos ES6** (`type="module"`), **no funciona** abriendo el archivo
directamente (`file://`). Necesita un servidor local:

- **VS Code**: instala la extensión *Live Server* → clic derecho en `index.html` → *Open with Live Server*.
- **Node**: `npx serve` dentro de la carpeta del proyecto.

## 📌 Cumplimiento de la consigna (Módulo 4)

| Requisito | Implementación |
|---|---|
| **POO** | Clases `Tarea` y `GestorTareas`, con métodos y propiedades privadas (`#`). |
| **ES6+** | `let`/`const`, template literals, arrow functions, destructuring, spread/rest. |
| **Eventos y DOM** | `submit`, `click`, `keyup` (contador de caracteres) y `mouseover` (resaltado de filas). |
| **Asincronía** | `setTimeout` (retardo al agregar + notificación) y `setInterval` (contador regresivo). |
| **Consumo de API** | `fetch` GET y POST a JSONPlaceholder + `localStorage`, con manejo de errores `try/catch`. |

---

Desarrollado por **Javiera Saavedra** — Full Stack JavaScript Trainee.
