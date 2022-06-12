/**
 * Fichero de configuración 
 * (base de datos y envío de correo).
 */

module.exports = {
    database: {
        host: 'eu-cdbr-west-02.cleardb.net',
        user: 'bc93ba3243c6b9',
        password: 'e1d6d869',
        database: 'heroku_3b6b8e630375d3c'
    },

    emailOptions: {
        from: 'linkinapp.confirmation@gmail.com',
        subject: 'Confirma tu correo electrónico - LINKIN',
        auth: 'zzqwsmqpegpkgyzu'
    }
}