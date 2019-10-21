// Initializer of the server

// Módulos
const Hapi = require('@hapi/hapi');
const routes = require("./routes.js");

// Servidor
const server = Hapi.server({
    port: 8080,
    host: 'localhost',
});

const iniciarServer = async () => {
    try {
        await server.register(routes);
        await server.start();
        console.log('Servidor localhost:8080');
    } catch (error) {
        console.log('Error '+error);
    }
};

iniciarServer();
