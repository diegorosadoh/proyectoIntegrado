CREATE DATABASE proyecto;
USE proyecto;

CREATE TABLE usuarios(
    email VARCHAR(40) NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(40) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'usuario',
    CONSTRAINT PK_usuarios PRIMARY KEY (email)
);

CREATE TABLE carpetas(
    id INT(9) NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(40) NOT NULL,
    usuario VARCHAR(40) NOT NULL,
    CONSTRAINT PK_carpetas PRIMARY KEY (id),
    CONSTRAINT FK_usuarioCarpeta FOREIGN KEY (usuario) REFERENCES usuarios(email)
);

CREATE TABLE links(
    id INT(9) NOT NULL AUTO_INCREMENT,
    enlace VARCHAR(255) NOT NULL,
    titulo VARCHAR(40) NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT current_timestamp,
    usuario VARCHAR(40) NOT NULL,
    carpeta INT(9) NULL,
    CONSTRAINT PK_links PRIMARY KEY (id),
    CONSTRAINT FK_usuarioLink FOREIGN KEY (usuario) REFERENCES usuarios(email),
    CONSTRAINT FK_carpetaLink FOREIGN KEY (carpeta) REFERENCES carpetas(id)
);

CREATE TABLE funcInteligente(
    id INT(9) NOT NULL AUTO_INCREMENT,
    enlace VARCHAR(4255) NOT NULL,
    carpeta INT(9) NOT NULL,
    CONSTRAINT PK_funcInteligente PRIMARY KEY (id),
    CONSTRAINT FK_carpetaFuncinteligente FOREIGN KEY (carpeta) REFERENCES carpetas(id)
);