// Creación de la conexión con la base de datos //

// Carga de 'mysql'
const mysql = require('mysql');

// Carga de 'promisify' del módulo 'util'
const { promisify } = require('util');

// Carga de la configuración de la base de datos
const { database } = require('./utils');

// Creación del objeto pool para la conexión
const pool = mysql.createPool(database);

// Recupera la conexión del objeto pool
pool.getConnection((err, connection) => {
    if(err){
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){ console.log('DATABASE CONNECTION WAS CLOSED'); }
        if(err.code === 'ER_CON_COUNT_ERROR'){ console.log('DATABASE HAS TOO MANY CONNECTIONS'); }
        if(err.code === 'ECONNREFUSED'){ console.log('DATABASE CONNECTION WAS REFUSED'); }
    }

    if(connection) connection.release();
    console.log('DB is connected');
    return;
});

// Promisificación para permitir consultas asíncronas
pool.query = promisify(pool.query);

module.exports = pool;