import { useState, useEffect } from 'react';

const es = {
  "common": {
    "admin": "Admin",
    "member": "Miembro",
    "viewer": "Observador",
    "guest": "Invitado",
    "todo": "Por Hacer",
    "inProgress": "En Progreso",
    "done": "Hecho",
    "low": "Baja",
    "medium": "Media",
    "high": "Alta",
    "online": "En línea",
    "away": "Ausente",
    "busy": "Ocupado",
    "offline": "Desconectado",
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "close": "Cerrar",
    "edit": "Editar",
    "add": "Añadir",
    "unassigned": "Sin asignar",
    "new": "Nuevo",
    "allStatuses": "Todos los Estados",
    "allPriorities": "Todas las Prioridades",
    "loading": "Cargando",
    "error": "Error",
    "success": "Éxito",
    "info": "Información",
    "tasks": "Tarea",
    "tasks_plural": "Tareas",
    "daysAgo": "hace {{count}} días",
    "hoursAgo": "hace {{count}} horas",
    "minutesAgo": "hace {{count}} min",
    "justNow": "justo ahora",
    "yearsAgo": "hace {{count}} años",
    "monthsAgo": "hace {{count}} meses",
    "areYouSure": "¿Estás seguro?",
    "actionCannotBeUndone": "Esta acción no se puede deshacer.",
    "yes": "Sí",
    "no": "No",
    "page": "Página",
    "of": "de",
    "previous": "Anterior",
    "next": "Siguiente",
    "today": "Hoy",
    "more": "más"
  },
  "sidebar": {
    "myTasks": "Mis Tareas",
    "dashboard": "Dashboard",
    "appAdmin": "Admin de App",
    "projects": "Proyectos",
    "newFolder": "Nueva Carpeta",
    "newProject": "Nuevo Proyecto",
    "settings": "Configuración",
    "viewProfile": "Ver Perfil",
    "logout": "Cerrar Sesión",
    "setStatus": "Establecer tu estado",
    "newWorkspace": "Nuevo Espacio de Trabajo",
    "viewProject": "Ver Proyecto"
  },
  "header": {
    "adminDashboard": "Dashboard de Admin",
    "appAdmin": "Administración de la Aplicación",
    "myTasks": "Mis Tareas",
    "searchPlaceholder": "Buscar (F)...",
    "commandPaletteTitle": "Comandos (⌘K)",
    "notifications": "Notificaciones",
    "openUserProfile": "Abrir perfil de usuario",
    "openSidebar": "Abrir barra lateral",
    "toggleNotifications": "Alternar notificaciones",
    "aiSummary": "Resumen con IA",
    "editProject": "Editar Proyecto",
    "deleteProject": "Eliminar Proyecto"
  },
  "footer": {
    "copyright": "© {{year}} Zenith Task. Todos los derechos reservados."
  },
  "mainContent": {
    "board": "Tablero",
    "list": "Lista",
    "calendar": "Calendario",
    "gantt": "Gantt",
    "dashboard": "Dashboard",
    "noProjectSelected": "Ningún Proyecto Seleccionado",
    "noProjectSelectedMessage": "Por favor, crea un nuevo proyecto en este espacio de trabajo o selecciona uno de la barra lateral.",
    "newTask": "Nuevo",
    "newTaskFromTemplate": "Nueva Tarea en Blanco",
    "templates": "Plantillas",
    "noTasksInList": "No hay tareas en esta lista. ¡Crea una para empezar!",
    "noTasksForGantt": "No hay tareas con fechas para mostrar en el diagrama de Gantt.",
    "createTaskTooltip": "Crear una nueva tarea (N)",
    "createTaskGuestTooltip": "Los invitados no pueden crear tareas",
    "createTaskNoProjectTooltip": "Selecciona un proyecto para crear una tarea"
  },
  "modals": {
    "editWorkspace": "Editar Espacio de Trabajo",
    "createWorkspace": "Crear Nuevo Espacio de Trabajo",
    "workspaceName": "Nombre del Espacio de Trabajo",
    "workspaceNamePlaceholder": "p. ej. Sprint de Marketing Q3",
    "workspaceNameEmptyError": "El nombre del espacio de trabajo no puede estar vacío.",
    "saveChanges": "Guardar Cambios",
    "create": "Crear",
    "editProject": "Editar Proyecto",
    "createProject": "Crear Nuevo Proyecto",
    "projectName": "Nombre del Proyecto",
    "projectNamePlaceholder": "p. ej. Rediseño de Sitio Web",
    "projectNameEmptyError": "El nombre del proyecto no puede estar vacío.",
    "folderOptional": "Carpeta (Opcional)",
    "noFolder": "Sin carpeta",
    "color": "Color",
    "editFolder": "Editar Carpeta",
    "createFolder": "Crear Nueva Carpeta",
    "folderName": "Nombre de la Carpeta",
    "folderNamePlaceholder": "p. ej. Iniciativas Q3",
    "folderNameEmptyError": "El nombre de la carpeta no puede estar vacío.",
    "manageMembers": "Gestionar Miembros",
    "addMember": "Añadir Nuevo Miembro",
    "fullName": "Nombre Completo",
    "addUser": "Añadir Usuario",
    "usernameEmptyError": "El nombre de usuario no puede estar vacío.",
    "manageRolesAdmin": "Puedes gestionar los roles de los usuarios.",
    "manageRolesNonAdmin": "Solo los administradores pueden gestionar los roles.",
    "done": "Hecho",
    "editYourProfile": "Editar Tu Perfil",
    "editProfileOf": "Editar Perfil de {{name}}",
    "jobTitle": "Cargo",
    "email": "Correo",
    "team": "Equipo",
    "aboutMe": "Acerca de mí",
    "aboutMePlaceholder": "Escribe una breve biografía...",
    "taskDependencies": "Dependencias de Tarea",
    "taskIsBlocking": "\"{{title}}\" está bloqueando:",
    "taskIsNotBlocking": "Esta tarea no está bloqueando ninguna otra tarea actualmente.",
    "dayTasksTitle": "{{day}}",
    "userTasksTitle": "Tareas de {{name}}",
    "allWorkspaces": "Todos los Espacios de Trabajo ({{count}})",
    "allProjects": "Todos los Proyectos ({{count}})",
    "allTasks": "Todas las Tareas",
    "allTasksCount": "Todas las Tareas ({{count}})",
    "noTasksInCategory": "No se encontraron tareas para esta categoría.",
    "allUsers": "Todos los Usuarios ({{count}})",
    "settings": "Configuración",
    "appearance": "Apariencia",
    "colorMode": "Modo de Color",
    "lightMode": "Modo Claro",
    "darkMode": "Modo Oscuro",
    "theme": "Tema",
    "language": "Idioma",
    "taskDetails": "Detalles de la Tarea",
    "taskTitlePlaceholder": "Título de la Tarea",
    "generateWithAI": "Generar con IA",
    "generateTitleDescWithAI": "Generar título y descripción con IA",
    "aiSuggestion": "✨ Sugerencia IA:",
    "aiSuggestionContent": "Prioridad {{priority}} Asignar a {{assignee}}",
    "apply": "Aplicar",
    "description": "Descripción",
    "addMoreDetail": "Añade una descripción más detallada...",
    "attachments": "Adjuntos",
    "attachFile": "+ Adjuntar Archivo",
    "subtasks": "Subtareas",
    "subtasksCompleted": "Subtareas ({{completed}}/{{total}})",
    "addSubtask": "+ Añadir una subtarea",
    "dependencies": "Dependencias",
    "dependsOn": "Depende de",
    "blocking": "Bloqueando",
    "addDependency": "+ Añadir",
    "noDependencies": "Esta tarea no tiene dependencias.",
    "noBlocking": "Esta tarea no está bloqueando ninguna otra tarea.",
    "noAvailableTasks": "No hay tareas disponibles",
    "comments": "Comentarios",
    "status": "Estado",
    "assignee": "Asignado",
    "priority": "Prioridad",
    "dueDate": "Fecha de Vencimiento",
    "reminder": "Recordatorio",
    "noReminder": "Sin recordatorio",
    "onDueDate": "En la fecha de vencimiento",
    "oneDayBefore": "1 día antes",
    "twoDaysBefore": "2 días antes",
    "oneWeekBefore": "1 semana antes",
    "createdAt": "Creado el",
    "deleteTask": "Eliminar Tarea",
    "saveAsTemplate": "Guardar como Plantilla",
    "saveAndClose": "Guardar y Cerrar",
    "confirmDeleteTask": "¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.",
    "confirmDeleteComment": "¿Estás seguro de que quieres eliminar este comentario?",
    "templateNamePrompt": "Ingresa un nombre para esta plantilla:",
    "generating": "Generando...",
    "aiSummaryFor": "Resumen IA para {{name}}",
    "generatingSummary": "Generando resumen, por favor espera...",
    "riskAnalysis": "Análisis de Riesgos con IA",
    "analyzeRisks": "Analizar Riesgos",
    "analyzing": "Analizando...",
    "riskAnalysisPrompt": "Haz clic en el botón para generar un análisis de riesgos para este proyecto.",
    "noTasksToAnalyze": "No hay tareas para analizar.",
    "commandPalettePlaceholder": "Escribe un comando o busca...",
    "noResultsFound": "No se encontraron resultados.",
    "commentPlaceholder": "Escribe un comentario... escribe @ para mencionar",
    "reply": "Responder",
    "comment": "Comentar",
    "searchingForSuggestions": "Buscando sugerencias de IA...",
    "suggesting": "Sugiriendo...",
    "suggestReplies": "✨ Sugerir Respuestas",
    "thisProject": "este proyecto"
  },
  "notifications": {
    "title": "Notificaciones",
    "markAllAsRead": "Marcar todo como leído",
    "noNotifications": "No tienes notificaciones.",
    "mentionMessage": "{{name}} te mencionó en un comentario en la tarea \"{{taskTitle}}\""
  },
  "userSelection": {
    "welcome": "Bienvenido a Zenith Task",
    "selectProfile": "Por favor, selecciona tu perfil para continuar"
  },
  "welcome": {
    "loading": "Cargando tu espacio de trabajo..."
  },
  "aiChat": {
    "title": "Asistente IA",
    "subtitle": "¡Pregúntame sobre tus proyectos!",
    "placeholder": "Ej: ¿Qué tareas están atrasadas?",
    "openAIAssistant": "Abrir Asistente IA",
    "actionCreating": "creando la tarea \"{{title}}\"",
    "actionUpdating": "actualizando la tarea \"{{title}}\"",
    "actionAssigning": "asignando la tarea \"{{title}}\"",
    "actionFallback": "ejecutando una acción",
    "actionMessage": "De acuerdo, {{actionText}}..."
  },
  "toasts": {
    "taskDeleted": "Tarea eliminada correctamente",
    "taskDeleted_plural": "{{count}} tareas eliminadas correctamente",
    "userProfileUpdated": "Perfil de usuario actualizado.",
    "userCreated": "Usuario \"{{name}}\" creado.",
    "userDeleted": "Usuario eliminado.",
    "workspaceUpdated": "Espacio de trabajo actualizado.",
    "workspaceCreated": "Espacio de trabajo creado.",
    "workspaceDeleted": "Espacio de trabajo eliminado.",
    "projectUpdated": "Proyecto actualizado.",
    "projectCreated": "Proyecto creado.",
    "projectDeleted": "Proyecto eliminado.",
    "folderUpdated": "Carpeta actualizada.",
    "folderCreated": "Carpeta creada.",
    "folderDeleted": "Carpeta eliminada.",
    "tasksReordered": "Orden de tareas actualizado.",
    "sidebarReordered": "Barra lateral reordenada.",
    "tasksUpdated": "{{count}} tarea actualizada.",
    "tasksUpdated_plural": "{{count}} tareas actualizadas.",
    "templateSaved": "Plantilla \"{{name}}\" guardada.",
    "projectNotFound": "Proyecto \"{{name}}\" no encontrado. Creando tarea en el proyecto actual.",
    "selectProjectFirst": "Por favor, selecciona un proyecto primero para añadir una tarea.",
    "userNotFound": "Usuario \"{{name}}\" no encontrado.",
    "taskCreatedByAI": "Tarea \"{{title}}\" creada por IA.",
    "taskStatusUpdated": "Estado de \"{{title}}\" actualizado a {{status}}.",
    "taskAssigned": "Tarea \"{{title}}\" asignada a {{name}}.",
    "taskNotFound": "Tarea \"{{title}}\" no encontrada.",
    "loginFailed": "Credenciales inválidas. Por favor, inténtalo de nuevo.",
    "signupFailed": "El correo electrónico ya está en uso. Por favor, inicia sesión.",
    "signupSuccess": "¡Registro exitoso! Bienvenido."
  },
  "gantt": {
    "taskName": "Nombre de la Tarea",
    "showList": "Ver Lista",
    "showChart": "Ver Gráfico"
  },
  "admin": {
    "totalTasks": "Tareas Totales",
    "completed": "Completadas",
    "overdue": "Atrasadas",
    "totalUsers": "Usuarios Totales",
    "tasksByStatus": "Tareas por Estado",
    "tasksByPriority": "Tareas por Prioridad",
    "userWorkload": "Carga de Trabajo de Usuario",
    "clearFilters": "Limpiar Filtros",
    "noUsersWithFilter": "No hay usuarios para mostrar con el filtro actual.",
    "members": "Miembros",
    "team": "Equipo",
    "role": "Rol",
    "assignedTasks": "Tareas Asignadas",
    "manageWorkspaces": "Gestión de Espacios de Trabajo",
    "manageUsers": "Gestión de Usuarios",
    "user": "Usuario",
    "email": "Correo",
    "actions": "Acciones",
    "noTasksWithFilter": "No hay tareas para mostrar con el filtro actual.",
    "roleDescriptions": "Descripciones de Roles",
    "adminDescription": "Control total. Puede gestionar espacios de trabajo, facturación y todos los miembros.",
    "memberDescription": "Puede crear y gestionar proyectos, tareas y carpetas. No puede gestionar miembros ni la configuración del espacio de trabajo.",
    "viewerDescription": "Puede ver y comentar en proyectos y tareas, pero no puede crear ni editar contenido.",
    "guestDescription": "Acceso limitado de solo lectura a proyectos o tareas específicas a las que se les invite."
  },
  "tooltips": {
    "deleteSubtask": "Eliminar subtarea",
    "viewProfile": "Ver perfil: {{name}}",
    "unassigned": "Sin asignar",
    "blocked": "Esta tarea está bloqueada por otras tareas.",
    "isBlocking": "Esta tarea está bloqueando: {{tasks}}",
    "dueDate": "Vence el {{date}}",
    "createdAt": "Creada el {{date}}",
    "subtasks": "Subtareas",
    "editTask": "Editar Tarea",
    "deleteTask": "Eliminar Tarea",
    "lastAdminRole": "No se puede cambiar el rol del último administrador",
    "lastAdminDelete": "No se puede eliminar al último administrador",
    "editUser": "Editar {{name}}",
    "deleteUser": "Eliminar {{name}}",
    "addTaskForDate": "Añadir tarea para {{date}}",
    "moveTask": "Mover Tarea",
    "openTask": "Abrir detalles de la tarea: {{title}}"
  },
  "confirmations": {
    "deleteProject": "Estás seguro de que quieres eliminar este proyecto? Todas las tareas dentro de él también serán eliminadas.",
    "deleteWorkspace": "¿Estás seguro de que quieres eliminar el espacio de trabajo \"{{name}}\"? Esto eliminará todos los proyectos y tareas asociados.",
    "deleteUser": "¿Estás seguro de que quieres eliminar a {{name}}? Todas sus tareas asignadas quedarán sin asignar.",
    "deleteFolder": "¿Estás seguro de que quieres eliminar esta carpeta? Los proyectos dentro de ella no serán eliminados, pero ya no estarán agrupados.",
    "deleteTasks": "¿Estás seguro de que quieres eliminar {{count}} tarea? Esta acción no se puede deshacer.",
    "deleteTasks_plural": "¿Estás seguro de que quieres eliminar {{count}} tareas? Esta acción no se puede deshacer.",
    "logout": "¿Estás seguro de que quieres cerrar sesión?"
  },
  "weekdays": {
    "sun": "Dom",
    "mon": "Lun",
    "tue": "Mar",
    "wed": "Mié",
    "thu": "Jue",
    "fri": "Vie",
    "sat": "Sáb"
  },
  "myTasks": {
    "noTasks": "No tienes tareas asignadas.",
    "goodJob": "¡Buen trabajo! Disfruta tu día."
  },
  "board": {
    "todo": "Por Hacer",
    "inProgress": "En Progreso",
    "done": "Hecho",
    "dropMessage": "Arrastra una tarea aquí o crea una nueva."
  },
  "listView": {
    "selected": "{{count}} tarea seleccionada",
    "selected_plural": "{{count}} tareas seleccionadas",
    "changeStatus": "Cambiar Estado",
    "changePriority": "Cambiar Prioridad",
    "changeAssignee": "Cambiar Asignado",
    "task": "Tarea",
    "assignee": "Asignado",
    "status": "Estado",
    "dueDate": "Fecha Venc.",
    "priority": "Prioridad",
    "actions": "Acciones",
    "noTasks": "No hay tareas en esta lista. ¡Crea una para empezar!"
  },
  "projectDashboard": {
    "tasksByStatus": "Tareas por Estado",
    "tasksByAssignee": "Tareas por Asignado",
    "noTasksToShow": "No hay tareas para mostrar.",
    "unassigned": "Sin Asignar"
  },
  "search": {
    "tasks": "Tareas",
    "projects": "Proyectos",
    "users": "Usuarios",
    "noResultsFor": "No se encontraron resultados para \"{{query}}\"."
  },
  "commandPalette": {
    "navigateToProject": "Ir al proyecto: {{name}}",
    "navigateTo": "Navegar",
    "myTasks": "Ir a Mis Tareas",
    "adminDashboard": "Ir al Dashboard de Admin",
    "appAdmin": "Ir a Admin de App",
    "create": "Crear",
    "createTask": "Crear nueva tarea",
    "general": "General",
    "toggleTheme": "Cambiar Modo Claro/Oscuro",
    "logout": "Cerrar Sesión"
  },
  "gemini": {
    "noTasksForSummary": "No hay tareas en este proyecto para resumir.",
    "summaryError": "Lo siento, no pude generar un resumen para el proyecto.",
    "riskAnalysisNoTasks": "No hay tareas para analizar riesgos.",
    "riskAnalysisError": "Lo siento, no pude generar un análisis de riesgos.",
    "connectionError": "Lo siento, estoy teniendo problemas para conectarme en este momento."
  },
  "auth": {
    "login": "Iniciar Sesión",
    "signup": "Registrarse",
    "email": "Correo Electrónico",
    "password": "Contraseña",
    "fullName": "Nombre Completo",
    "loginToAccount": "Inicia sesión en tu cuenta",
    "createAnAccount": "Crea una cuenta nueva",
    "dontHaveAccount": "¿No tienes una cuenta?",
    "alreadyHaveAccount": "¿Ya tienes una cuenta?"
  }
};
const en = {
  "common": {
    "admin": "Admin",
    "member": "Member",
    "viewer": "Viewer",
    "guest": "Guest",
    "todo": "Todo",
    "inProgress": "In Progress",
    "done": "Done",
    "low": "Low",
    "medium": "Medium",
    "high": "High",
    "online": "Online",
    "away": "Away",
    "busy": "Busy",
    "offline": "Offline",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "close": "Close",
    "edit": "Edit",
    "add": "Add",
    "unassigned": "Unassigned",
    "new": "New",
    "allStatuses": "All Statuses",
    "allPriorities": "All Priorities",
    "loading": "Loading",
    "error": "Error",
    "success": "Success",
    "info": "Info",
    "tasks": "Task",
    "tasks_plural": "Tasks",
    "daysAgo": "{{count}} days ago",
    "hoursAgo": "{{count}} hours ago",
    "minutesAgo": "{{count}} min ago",
    "justNow": "just now",
    "yearsAgo": "{{count}} years ago",
    "monthsAgo": "{{count}} months ago",
    "areYouSure": "Are you sure?",
    "actionCannotBeUndone": "This action cannot be undone.",
    "yes": "Yes",
    "no": "No",
    "page": "Page",
    "of": "of",
    "previous": "Previous",
    "next": "Next",
    "today": "Today",
    "more": "more"
  },
  "sidebar": {
    "myTasks": "My Tasks",
    "dashboard": "Dashboard",
    "appAdmin": "App Admin",
    "projects": "Projects",
    "newFolder": "New Folder",
    "newProject": "New Project",
    "settings": "Settings",
    "viewProfile": "View Profile",
    "logout": "Log Out",
    "setStatus": "Set your status",
    "newWorkspace": "New Workspace",
    "viewProject": "View Project"
  },
  "header": {
    "adminDashboard": "Admin Dashboard",
    "appAdmin": "Application Administration",
    "myTasks": "My Tasks",
    "searchPlaceholder": "Search (F)...",
    "commandPaletteTitle": "Commands (⌘K)",
    "notifications": "Notifications",
    "openUserProfile": "Open user profile",
    "openSidebar": "Open sidebar",
    "toggleNotifications": "Toggle notifications",
    "aiSummary": "AI Summary",
    "editProject": "Edit Project",
    "deleteProject": "Delete Project"
  },
  "footer": {
    "copyright": "© {{year}} Zenith Task. All rights reserved."
  },
  "mainContent": {
    "board": "Board",
    "list": "List",
    "calendar": "Calendar",
    "gantt": "Gantt",
    "dashboard": "Dashboard",
    "noProjectSelected": "No Project Selected",
    "noProjectSelectedMessage": "Please create a new project in this workspace or select one from the sidebar.",
    "newTask": "New",
    "newTaskFromTemplate": "New Blank Task",
    "templates": "Templates",
    "noTasksInList": "There are no tasks in this list. Create one to get started!",
    "noTasksForGantt": "No tasks with dates to display in Gantt view.",
    "createTaskTooltip": "Create a new task (N)",
    "createTaskGuestTooltip": "Guests cannot create tasks",
    "createTaskNoProjectTooltip": "Select a project to create a task"
  },
  "modals": {
    "editWorkspace": "Edit Workspace",
    "createWorkspace": "Create New Workspace",
    "workspaceName": "Workspace Name",
    "workspaceNamePlaceholder": "e.g. Q3 Marketing Sprint",
    "workspaceNameEmptyError": "Workspace name cannot be empty.",
    "saveChanges": "Save Changes",
    "create": "Create",
    "editProject": "Edit Project",
    "createProject": "Create New Project",
    "projectName": "Project Name",
    "projectNamePlaceholder": "e.g. Website Redesign",
    "projectNameEmptyError": "Project name cannot be empty.",
    "folderOptional": "Folder (Optional)",
    "noFolder": "No folder",
    "color": "Color",
    "editFolder": "Edit Folder",
    "createFolder": "Create New Folder",
    "folderName": "Folder Name",
    "folderNamePlaceholder": "e.g. Q3 Initiatives",
    "folderNameEmptyError": "Folder name cannot be empty.",
    "manageMembers": "Manage Members",
    "addMember": "Add New Member",
    "fullName": "Full Name",
    "addUser": "Add User",
    "usernameEmptyError": "Username cannot be empty.",
    "manageRolesAdmin": "You can manage user roles.",
    "manageRolesNonAdmin": "Only admins can manage roles.",
    "done": "Done",
    "editYourProfile": "Edit Your Profile",
    "editProfileOf": "Edit {{name}}'s Profile",
    "jobTitle": "Job Title",
    "email": "Email",
    "team": "Team",
    "aboutMe": "About me",
    "aboutMePlaceholder": "Write a short bio...",
    "taskDependencies": "Task Dependencies",
    "taskIsBlocking": "\"{{title}}\" is blocking:",
    "taskIsNotBlocking": "This task is not currently blocking any other tasks.",
    "dayTasksTitle": "{{day}}",
    "userTasksTitle": "{{name}}'s Tasks",
    "allWorkspaces": "All Workspaces ({{count}})",
    "allProjects": "All Projects ({{count}})",
    "allTasks": "All Tasks",
    "allTasksCount": "All Tasks ({{count}})",
    "noTasksInCategory": "No tasks were found for this category.",
    "allUsers": "All Users ({{count}})",
    "settings": "Settings",
    "appearance": "Appearance",
    "colorMode": "Color Mode",
    "lightMode": "Light Mode",
    "darkMode": "Dark Mode",
    "theme": "Theme",
    "language": "Language",
    "taskDetails": "Task Details",
    "taskTitlePlaceholder": "Task Title",
    "generateWithAI": "Generate with AI",
    "generateTitleDescWithAI": "Generate title & description with AI",
    "aiSuggestion": "✨ AI Suggestion:",
    "aiSuggestionContent": "Priority {{priority}} Assign to {{assignee}}",
    "apply": "Apply",
    "description": "Description",
    "addMoreDetail": "Add a more detailed description...",
    "attachments": "Attachments",
    "attachFile": "+ Attach File",
    "subtasks": "Subtasks",
    "subtasksCompleted": "Subtareas ({{completed}}/{{total}})",
    "addSubtask": "+ Add a subtask",
    "dependencies": "Dependencies",
    "dependsOn": "Depends on",
    "blocking": "Blocking",
    "addDependency": "+ Add",
    "noDependencies": "This task has no dependencies.",
    "noBlocking": "This task is not blocking any other tasks.",
    "noAvailableTasks": "No available tasks",
    "comments": "Comments",
    "status": "Status",
    "assignee": "Assignee",
    "priority": "Priority",
    "dueDate": "Due Date",
    "reminder": "Reminder",
    "noReminder": "No reminder",
    "onDueDate": "On due date",
    "oneDayBefore": "1 day before",
    "twoDaysBefore": "2 days before",
    "oneWeekBefore": "1 week before",
    "createdAt": "Created at",
    "deleteTask": "Delete Task",
    "saveAsTemplate": "Save as Template",
    "saveAndClose": "Save & Close",
    "confirmDeleteTask": "Are you sure you want to delete this task? This action cannot be undone.",
    "confirmDeleteComment": "Are you sure you want to delete this comment?",
    "templateNamePrompt": "Enter a name for this template:",
    "generating": "Generating...",
    "aiSummaryFor": "AI Summary for {{name}}",
    "generatingSummary": "Generating summary, please wait...",
    "riskAnalysis": "AI Risk Analysis",
    "analyzeRisks": "Analyze Risks",
    "analyzing": "Analyzing...",
    "riskAnalysisPrompt": "Click the button to generate a risk analysis for this project.",
    "noTasksToAnalyze": "No tasks to analyze.",
    "commandPalettePlaceholder": "Type a command or search...",
    "noResultsFound": "No results found.",
    "commentPlaceholder": "Write a comment... type @ to mention",
    "reply": "Reply",
    "comment": "Comment",
    "searchingForSuggestions": "Searching for AI suggestions...",
    "suggesting": "Suggesting...",
    "suggestReplies": "✨ Suggest Replies",
    "thisProject": "this project"
  },
  "notifications": {
    "title": "Notifications",
    "markAllAsRead": "Mark all as read",
    "noNotifications": "You have no notifications.",
    "mentionMessage": "{{name}} mentioned you in a comment on task \"{{taskTitle}}\""
  },
  "userSelection": {
    "welcome": "Welcome to Zenith Task",
    "selectProfile": "Please select your profile to continue"
  },
  "welcome": {
    "loading": "Loading your workspace..."
  },
  "aiChat": {
    "title": "AI Assistant",
    "subtitle": "Ask me about your projects!",
    "placeholder": "Ex: Which tasks are overdue?",
    "openAIAssistant": "Open AI Assistant",
    "actionCreating": "creating task \"{{title}}\"",
    "actionUpdating": "updating task \"{{title}}\"",
    "actionAssigning": "assigning task \"{{title}}\"",
    "actionFallback": "performing an action",
    "actionMessage": "Okay, {{actionText}}..."
  },
  "toasts": {
    "taskDeleted": "Task deleted successfully",
    "taskDeleted_plural": "{{count}} tasks deleted successfully",
    "userProfileUpdated": "User profile updated.",
    "userCreated": "User \"{{name}}\" created.",
    "userDeleted": "User deleted.",
    "workspaceUpdated": "Workspace updated.",
    "workspaceCreated": "Workspace created.",
    "workspaceDeleted": "Workspace deleted.",
    "projectUpdated": "Project updated.",
    "projectCreated": "Project created.",
    "projectDeleted": "Project deleted.",
    "folderUpdated": "Folder updated.",
    "folderCreated": "Folder created.",
    "folderDeleted": "Folder deleted.",
    "tasksReordered": "Task order updated.",
    "sidebarReordered": "Sidebar reordered.",
    "tasksUpdated": "{{count}} task updated.",
    "tasksUpdated_plural": "{{count}} tasks updated.",
    "templateSaved": "Template \"{{name}}\" saved.",
    "projectNotFound": "Project \"{{name}}\" not found. Creating task in the current project.",
    "selectProjectFirst": "Please select a project first to add a task.",
    "userNotFound": "User \"{{name}}\" not found.",
    "taskCreatedByAI": "Task \"{{title}}\" created by AI.",
    "taskStatusUpdated": "Status of \"{{title}}\" updated to {{status}}.",
    "taskAssigned": "Task \"{{title}}\" assigned to {{name}}.",
    "taskNotFound": "Task \"{{title}}\" not found.",
    "loginFailed": "Invalid credentials. Please try again.",
    "signupFailed": "Email is already in use. Please log in.",
    "signupSuccess": "Signup successful! Welcome."
  },
  "gantt": {
    "taskName": "Task Name",
    "showList": "Show List",
    "showChart": "Show Chart"
  },
  "admin": {
    "totalTasks": "Total Tasks",
    "completed": "Completed",
    "overdue": "Overdue",
    "totalUsers": "Total Users",
    "tasksByStatus": "Tasks by Status",
    "tasksByPriority": "Tasks by Priority",
    "userWorkload": "User Workload",
    "clearFilters": "Clear Filters",
    "noUsersWithFilter": "No users to show with current filter.",
    "members": "Members",
    "team": "Team",
    "role": "Role",
    "assignedTasks": "Assigned Tasks",
    "manageWorkspaces": "Workspace Management",
    "manageUsers": "User Management",
    "user": "User",
    "email": "Email",
    "actions": "Actions",
    "noTasksWithFilter": "No tasks to show with the current filter.",
    "roleDescriptions": "Role Descriptions",
    "adminDescription": "Full control. Can manage workspaces, billing, and all members.",
    "memberDescription": "Can create and manage projects, tasks, and folders. Cannot manage members or workspace settings.",
    "viewerDescription": "Can view and comment on projects and tasks, but cannot create or edit content.",
    "guestDescription": "Limited, read-only access to specific projects or tasks they are invited to."
  },
  "tooltips": {
    "deleteSubtask": "Delete subtask",
    "viewProfile": "View profile: {{name}}",
    "unassigned": "Unassigned",
    "blocked": "This task is blocked by other tasks.",
    "isBlocking": "This task is blocking: {{tasks}}",
    "dueDate": "Due on {{date}}",
    "createdAt": "Created on {{date}}",
    "subtasks": "Subtasks",
    "editTask": "Edit Task",
    "deleteTask": "Delete Task",
    "lastAdminRole": "Cannot change role of the last admin",
    "lastAdminDelete": "Cannot delete the last admin",
    "editUser": "Edit {{name}}",
    "deleteUser": "Delete {{name}}",
    "addTaskForDate": "Add task for {{date}}",
    "moveTask": "Move Task",
    "openTask": "Open task details for: {{title}}"
  },
  "confirmations": {
    "deleteProject": "Are you sure you want to delete this project? All tasks within it will also be deleted.",
    "deleteWorkspace": "Are you sure you want to delete the workspace \"{{name}}\"? This will delete all associated projects and tasks.",
    "deleteUser": "Are you sure you want to delete {{name}}? All of their assigned tasks will become unassigned.",
    "deleteFolder": "Are you sure you want to delete this folder? Projects within it will not be deleted, but will no longer be grouped.",
    "deleteTasks": "Are you sure you want to delete {{count}} task? This action cannot be undone.",
    "deleteTasks_plural": "Are you sure you want to delete {{count}} tasks? This action cannot be undone.",
    "logout": "Are you sure you want to log out?"
  },
  "weekdays": {
    "sun": "Sun",
    "mon": "Mon",
    "tue": "Tue",
    "wed": "Wed",
    "thu": "Thu",
    "fri": "Fri",
    "sat": "Sat"
  },
  "myTasks": {
    "noTasks": "You have no tasks assigned to you.",
    "goodJob": "Good job! Enjoy your day."
  },
  "board": {
    "todo": "To Do",
    "inProgress": "In Progress",
    "done": "Done",
    "dropMessage": "Drag a task here or create a new one."
  },
  "listView": {
    "selected": "{{count}} task selected",
    "selected_plural": "{{count}} tasks selected",
    "changeStatus": "Change Status",
    "changePriority": "Change Priority",
    "changeAssignee": "Change Assignee",
    "task": "Task",
    "assignee": "Assignee",
    "status": "Status",
    "dueDate": "Due Date",
    "priority": "Priority",
    "actions": "Actions",
    "noTasks": "There are no tasks in this list. Create one to get started!"
  },
  "projectDashboard": {
    "tasksByStatus": "Tasks by Status",
    "tasksByAssignee": "Tasks by Assignee",
    "noTasksToShow": "No tasks to display.",
    "unassigned": "Unassigned"
  },
  "search": {
    "tasks": "Tasks",
    "projects": "Projects",
    "users": "Users",
    "noResultsFor": "No results found for \"{{query}}\"."
  },
  "commandPalette": {
    "navigateToProject": "Go to project: {{name}}",
    "navigateTo": "Navigate",
    "myTasks": "Go to My Tasks",
    "adminDashboard": "Go to Admin Dashboard",
    "appAdmin": "Go to App Admin",
    "create": "Create",
    "createTask": "Create new task",
    "general": "General",
    "toggleTheme": "Toggle Light/Dark Mode",
    "logout": "Log Out"
  },
  "gemini": {
    "noTasksForSummary": "There are no tasks in this project to summarize.",
    "summaryError": "Sorry, I couldn't generate a summary for the project.",
    "riskAnalysisNoTasks": "There are no tasks to analyze for risks.",
    "riskAnalysisError": "Sorry, I couldn't generate a risk analysis.",
    "connectionError": "Sorry, I'm having trouble connecting right now."
  },
  "auth": {
    "login": "Login",
    "signup": "Sign Up",
    "email": "Email Address",
    "password": "Password",
    "fullName": "Full Name",
    "loginToAccount": "Login to your account",
    "createAnAccount": "Create a new account",
    "dontHaveAccount": "Don't have an account?",
    "alreadyHaveAccount": "Already have an account?"
  }
};

const resources = {
  es: { translation: es },
  en: { translation: en },
};

type Language = 'es' | 'en';

let currentLanguage: Language = (localStorage.getItem('language') as Language) || 'es';
const listeners: Set<() => void> = new Set();

const getNested = (obj: any, path: string): string | undefined => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

// Define a more specific type for the options parameter to improve type safety
type I18nOptions = {
    defaultValue?: string;
    count?: number;
    [key: string]: any;
};

export const i18n = {
  get language(): Language {
    return currentLanguage;
  },

  changeLanguage: (lang: Language) => {
    if (lang === currentLanguage) return;
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    listeners.forEach(listener => listener());
  },

  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  t: (key: string, options?: I18nOptions): string => {
    const langResources = resources[currentLanguage]?.translation;
    let translation: string | undefined;

    // Handle pluralization first if count is provided
    if (options && typeof options.count !== 'undefined' && options.count !== 1) {
        const pluralKey = `${key}_plural`;
        translation = getNested(langResources, pluralKey) || getNested(resources.en.translation, pluralKey);
    }

    // If not plural or plural key not found, try singular key
    if (typeof translation !== 'string') {
        translation = getNested(langResources, key) || getNested(resources.en.translation, key);
    }
    
    // If still not found, fallback to defaultValue or key
    if (typeof translation !== 'string') {
        console.warn(`Translation key '${key}' not found for language '${currentLanguage}'.`);
        // FIX: Use optional chaining to safely access defaultValue
        return options?.defaultValue || key;
    }

    if (options) {
      Object.keys(options).forEach(optKey => {
        if (optKey !== 'defaultValue') {
            const regex = new RegExp(`{{${optKey}}}`, 'g');
            translation = translation!.replace(regex, String(options[optKey]));
        }
      });
    }

    return translation;
  }
};

export const useTranslation = () => {
    const [, setTick] = useState(0);

    useEffect(() => {
        const forceUpdate = () => setTick(tick => tick + 1);
        const unsubscribe = i18n.subscribe(forceUpdate);
        return unsubscribe;
    }, []);

    return {
        t: i18n.t,
        i18n,
    };
};