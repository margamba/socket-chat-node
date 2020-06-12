const { io } = require('../server');

const { Usuarios } = require('./../classes/usuarios');

const { crearMensaje } = require('./../utils/utils');

const usuarios = new Usuarios();



io.on('connection', (client) => {

    // Escuchar el cliente
    client.on('entrarChat', (data, callback) => {

        console.log(data);
        if (!data.nombre || !data.sala) {
            return callback({
                err: true,
                mensaje: 'El nombre/sala es requerido'
            });
        }


        client.join(data.sala);

        let personas = usuarios.agregarPersona(client.id, data.nombre, data.sala);

        client.broadcast.to(data.sala).emit('listaPersonas', usuarios.getPersonasSala(data.sala));
        client.broadcast.to(data.sala).emit('crearMensaje', crearMensaje('Admin', `${data.nombre} se unió`));
        callback(usuarios.getPersonasSala(data.sala));


        client.on('crearMensaje', (data, callback) => {

            let persona = usuarios.getPersona(client.id);
            let mensaje = crearMensaje(persona.nombre, data.mensaje);
            client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);

            callback(mensaje);

        })

        client.on('disconnect', () => {

            let personaBorrada = usuarios.borrarPersona(client.id);

            client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Admin', `${personaBorrada.nombre} salió`));

            client.broadcast.to(personaBorrada.sala).emit('listaPersonas', usuarios.getPersonasSala(personaBorrada.sala));


        });

        //Mensajes privados
        //data.para es el id de la persona a la cual va dirigido el mensaje
        client.on('mensajePrivado', (data) => {
            let persona = usuarios.getPersona(client.id);
            client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));

        });






    });

});