module.exports = { // Permite hacer futuros imports
    // Hapi needs a name for the module
    name: 'MyRouter',
    // Register function is run the moment hapi inserts the module
    register: async (server, options) => {
        // When registering the routes. create a pointer to the DB
        repositorio = server.methods.getRepositorio();
        server.route([
            {
                method: 'POST',
                path: '/publicar',
                handler: async (req, h) => {
                    // Parse form data
                    anuncio = {
                        usuario: "sin usuario",
                        titulo: req.payload.titulo,
                        descripcion: req.payload.descripcion,
                        categoria: req.payload.categoria,
                        precio: Number.parseFloat(req.payload.precio),
                    }
                    // await no continuar hasta acabar esto
                    // Da valor a respuesta
                    await repositorio.conexion()
                        .then((db) => repositorio.insertarAnuncio(db, anuncio))
                        .then((id) => {
                            respuesta = "";
                            if (id == null) {
                                respuesta =  "Error al insertar"
                            } else {
                                respuesta = "Insertado id:  "+ id;
                            }
                        })
                    return respuesta;
                }
            },
            {
                method: 'GET',
                path: '/publicar',
                handler: async (req, h) => {
                    return h.view('publicar',
                        { usuario: 'ragna'},
                        { layout: 'base'});
                }
            },
            {
                // Prueba para ver la base
                method: 'GET',
                path: '/base',
                handler: {
                    view: 'layout/base'
                }
            },
            {
                method: 'GET',
                path: '/anuncios',
                handler: async (req, h) => {
                    // Hardcoded array of advertisements
                    anunciosEjemplo = [
                        {titulo: "iphone", precio: 400},
                        {titulo: "xBox", precio: 300},
                        {titulo: "teclado", precio: 30},
                    ]
                    return h.view('anuncios',
                        {
                            usuario: 'ragna',
                            anuncios: anunciosEjemplo
                        });
                }
            },
            {
                // Controlador especial gracias a @hapi/inert. Redirige peticiones GET/... a
                // los ficheros de public
                method: 'GET',
                path: '/{param*}',
                handler: {
                    directory: {
                        path: './public'
                    }
                }
            },
            {
                // Specify controller for specific URL path /anuncio/id
                method: 'GET',
                path: '/anuncio/{id}',
                handler: async (req, h) => {
                    return 'Anuncio id: ' + req.params.id;
                }
            },
            {
                method: 'GET',
                path: '/',
                handler: async (req, h) => {
                    // Query the request for parameters
                    return h.view('index',
                        { usuario: 'ragna'},
                        { layout: 'base'});
                }
            }
        ])
    }
}
