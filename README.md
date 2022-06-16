# Proyecto Integrado

Aplicación Web para almacenar URLs

---

Diego Rosado Hernández

Tutor: José Antonio Piñero Berbel

Departamento de Informática

IES Francisco Ayala

Junio de 2022

---

[Aplicación en producción](https://link-organizer-proyecto.herokuapp.com)

## Resumen

El proyecto consta de una aplicación web destinada al almacenamiento de URLs. El usuario, en primera instancia, podrá registrarse y/o iniciar sesión en la página, requiriéndose únicamente un correo electrónico, un nombre de usuario y una contraseña. Una vez registrado y verificado (mediante un correo de confirmación), el usuario que inicie sesión accederá a la página principal, en la que se muestran todos los enlaces guardados. Para añadir un nuevo enlace el usuario introducirá los datos necesarios, a saber: la URL, un título y una descripción. Los enlaces podrán organizarse en carpetas creadas por el usuario, listadas en la barra de navegación junto con un campo de texto para añadir una nueva. Además de la organización por carpetas, los enlaces se ordenarán automáticamente por categorías predefinidas (páginas web de noticias, de artículos académicos, de contenido multimedia, etc.). La vista de cada enlace permite su acceso a la URL almacenada en una nueva pestaña del navegador, así como a su edición y borrado.

## Manual de usuario

### Registro

Para poder hacer uso de la aplicación, el usuario debe de estar registrado. Para ello, debe rellenar todos los campos del formulario (todos son obligatorios). El nombre puede contener hasta 20 caracteres alfabéticos y espacios. La contraseña debe de ser, al menos, de 8 caracteres.

Al registrarse, el usuario recibirá en su bandeja de entrada un email con un enlace para verificar su cuenta. Al seguir el enlace del email, la cuenta se da de alta y se muestra la pantalla de inicio de sesión.

### Inicio de sesión

Es la pantalla que se muestra por defecto al entrar a la página web. Una vez registrado, el usuario puede iniciar sesión introduciendo su email y contraseña. Al hacerlo, se mostrará la vista general de enlaces.

### Enlace

Cada enlace muestra el título, la fecha de creación y la descripción. Al pulsar sobre el título se abre una nueva pestaña con la URL almacenada. Al pasar el ratón sobre la fecha se muestra a su lado la hora de creación. El botón de la esquina inferior derecha borra el enlace, mientras que el botón de la esquina inferior izquierda redirige al usuario al formulario de edición del enlace.

### Vista general de enlaces

Es la pantalla que se muestra por defecto al entrar a la página web si el usuario ha iniciado sesión. Se puede acceder también a esta vista pulsando ‘Links’ en el menú de navegación.

### Vista de enlaces por categorías

De manera automática, los enlaces del usuario se organizan mediante categorías predefinidas según la URL pertenezca a determinado grupo de páginas.

### Creación de enlaces

Pulsando sobre el título principal de la página o sobre el botón ‘Nuevo link’ del menú de navegación, se accede al formulario para la creación de un nuevo enlace. Deben rellenarse los campos de enlace, título y descripción (este último es opcional) y seleccionar la carpeta de destino si fuera necesario. El título puede contener hasta 15 caracteres, y tanto este como la descripción admiten caracteres alfanuméricos y signos de puntuación.

### Menú de navegación

En la barra de navegación se muestran varios botones que redirigen a distintas páginas:

- **Nuevo link**: Página para crear un nuevo link.
- **Links**: Vista general de links.
- **Categorías**: Vista de links por categorías.
- **Sección de carpetas**: Carpetas del usuario.
Pulsando sobre cualquiera de las carpetas se accede a la vista de los links de esa carpeta. Al pasar el ratón por encima de alguna de ellas, se muestra una ‘X’ a la derecha que elimina la carpeta:
- **Mi perfil**: Vista del perfil del usuario.
- **Cerrar sesión**

En el caso de que el usuario aún no haya iniciado sesión, el menú de navegación mostraría únicamente dos botones para el acceso a los formularios de inicio de sesión y registro.

### Vista de enlaces por carpetas

Muy similar a la vista general, pero se muestra el nombre de la carpeta seleccionada. Pasando el ratón sobre ella se muestra un botón para eliminar todos sus links.

### Paneles de confirmación

Tanto al intentar borrar los links de una carpeta o la misma carpeta, se muestra una pantalla de confirmación:

### Perfil

En la página del perfil del usuario se muestran los datos referidos al nombre, email y número de links guardados, junto con un formulario para editar el nombre y la contraseña. Estos campos tienen las mismas restricciones que en el registro.

### Edición de enlaces

Al pulsar sobre el botón de edición de un enlace, se muestra el mismo formulario que el usado en la creación de enlaces, pero con los datos del enlace ya informados. Los campos tienen las mismas restricciones que en su creación.

---