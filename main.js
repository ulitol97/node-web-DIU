// Initializer of the server

// Módulos (imports)
const Hapi = require('@hapi/hapi');
const routes = require("./routes.js");
const Inert = require('@hapi/inert');
const Cookie = require('@hapi/cookie');
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
// Quick method to obtain the secret for encrypting keys
server.method({
    name: 'getSecret',
    method: () => {
        return "secreto";
    },
    options: {}
});


const iniciarServer = async () => {
    try {
        // Registrar el Inert antes de usar directory en routes
        await server.register(Inert);
        //  Register template components
        await server.register(Vision);
        //  Register cookie component
        await server.register(Cookie);

        //Configurar seguridad gracias al componente de Cookie.
        // Nombre personalizado de este sistema de autenticación
        await server.auth.strategy('auth-registrado', 'cookie', {
            cookie: {
                name: 'session-id',
                password: 'secretosecretosecretosecretosecretosecretosecreto', // we need a long password
                isSecure: false
            },
            redirectTo: '/login', // Redirect to login when auth fails
            // How to validate that the auth is OK using cookies:
            validateFunc: function (request, cookie){
                promise = new Promise((resolve, reject) => {
                    // Check that a cookie exists, contains a user and a secret key which is the same as
                    // one you use in your app. This "secreto" is not the one used when encrypting passwords,...
                    if ( cookie.usuario != null && cookie.usuario != "" &&
                        cookie.secreto == "secreto"){
                        resolve({valid: true,
                            credentials: cookie.usuario});
                    } else {
                        resolve({valid: false});
                    }
                });
                return promise;
            }
        });

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
