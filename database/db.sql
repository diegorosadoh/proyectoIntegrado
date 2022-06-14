CREATE TABLE usuarios(
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(20) NOT NULL,
    CONSTRAINT PK_usuarios PRIMARY KEY (email)
);

CREATE TABLE carpetas(
    id INT(9) NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(15) NOT NULL,
    usuario VARCHAR(255) NOT NULL,
    CONSTRAINT PK_carpetas PRIMARY KEY (id),
    CONSTRAINT FK_usuarioCarpeta FOREIGN KEY (usuario) REFERENCES usuarios(email)
);

CREATE TABLE links(
    id INT(9) NOT NULL AUTO_INCREMENT,
    enlace VARCHAR(255) NOT NULL,
    titulo VARCHAR(15) NOT NULL,
    descripcion VARCHAR(255) NULL,
    fecha TIMESTAMP NOT NULL DEFAULT current_timestamp,
    usuario VARCHAR(255) NOT NULL,
    carpeta INT(9) NULL,
    CONSTRAINT PK_links PRIMARY KEY (id),
    CONSTRAINT FK_usuarioLink FOREIGN KEY (usuario) REFERENCES usuarios(email),
    CONSTRAINT FK_carpetaLink FOREIGN KEY (carpeta) REFERENCES carpetas(id)
);

CREATE TABLE pending_usuarios(
    code VARCHAR(255) NOT NULL,
    user VARCHAR(255) NOT NULL,
    CONSTRAINT PK_pending_usuarios PRIMARY KEY (code)
);