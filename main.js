// Initializer of the server

// Módulos (imports)
const Hapi = require('@hapi/hapi');
const routes = require("./routes.js");
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const repositorio = require("./repositorio.js");

// Servidor
const server = Hapi.server({
    port: 8080,
    host: 'localhost',
});

// declarar metodos comunes
// Esto es algo que nos da hapi. El servidor tiene unos methods que son accesibles desde toda la app.
server.method({
    name: 'getRepositorio',
    method: () => {
        return repositorio;
    },
    options: {}
});


const iniciarServer = async () => {
    try {
        // Registrar el Inert antes de usar directory en routes
        await server.register(Inert);
        await server.register(Vision);
        await server.register(routes);
        // Configure hapi views
        await server.views({
            engines: {
                // HTML template engine
                html: require('handlebars')
            },
            relativeTo: __dirname,
            path: './views',
            layoutPath: './views/layout', // Where to look for the layouts
            context : { // El objeto context guarda info accesible entre plantillas
                sitioWeb: "wallapep"
            }
        });

        await server.start();
        console.log('Servidor localhost:8080');
    } catch (error) {
        console.log('Error '+error);
    }
};

iniciarServer();
