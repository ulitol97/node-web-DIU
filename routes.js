module.exports = { // Permite hacer futuros imports
    // Hapi needs a name for the module
    name: 'MyRouter',
    // file upload helper
    utilSubirFichero : async (binario, nombre, extension) => {
        return new Promise((resolve, reject) => {
            nombre = nombre + "." + extension;
            // We are using node's fs module (filesystem)
            require('fs').writeFile('./public/uploads/'+nombre, binario, err => {
                if (err) {
                    resolve(false)
                }
                resolve(true)
            })
        })
    },
    // Register function is run the moment hapi inserts the module
    register: async (server, options) => {
        // When registering the routes. create a pointer to the DB
        repositorio = server.methods.getRepositorio();
        server.route([
            {
                method: 'GET',
                path: '/misanuncios',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    // The search criteria in mongodb relies on the credentials travelling with the cookie
                    // When we crate an add, we make the creator the user stored in the cookie
                    var criterio = { "usuario" : req.auth.credentials };
                    // cookieAuth
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerAnuncios(db, criterio))
                        .then((anuncios) => {
                            anunciosEjemplo = anuncios;
                        })

                    return h.view('anuncios',
                        { anuncios: anunciosEjemplo },
                        { layout: 'base'} );
                }
            },
            {
                method: 'GET',
                path: '/desconectarse',
                handler: async (req, h) => {
                    req.cookieAuth.set({ usuario: "", secreto: "" });
                    return h.view('login',
                        { },
                        { layout: 'base'});
                }
            },
            {
                method: 'POST',
                path: '/login',
                handler: async (req, h) => {
                    password = require('crypto').createHmac('sha256', server.methods.getSecret())
                        .update(req.payload.password).digest('hex');
                    // We build a user with the data provided in the post request
                    usuarioABuscar = {
                        usuario: req.payload.usuario,
                        password: password,
                    }
                    // await no continuar hasta acabar esto
                    // Buscar en usuarios con el usuario a buscar como criterio
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerUsuarios(db, usuarioABuscar))
                        .then((usuarios) => {
                            respuesta = "";
                            if (usuarios == null || usuarios.length == 0 ) {
                                respuesta =  "No identificado"
                            } else {
                                // On correct authentication
                                req.cookieAuth.set({
                                    usuario: usuarios[0].usuario,
                                    secreto : "secreto"
                                });

                                respuesta = "Identificado correctamente";
                            }
                        })

                    return respuesta;
                }
            },
            {
                method: 'GET',
                path: '/login',
                handler: async (req, h) => {
                    return h.view('login',
                        { },
                        { layout: 'base'});
                }
            },
            {
                method: 'POST',
                path: '/registro',
                handler: async (req, h) => {
                    // We should use a better secret key
                    password = require('crypto').createHmac('sha256', server.methods.getSecret())
                        .update(req.payload.password).digest('hex');

                    usuario = {
                        usuario: req.payload.usuario,
                        password: password,
                    }
                    // await no continuar hasta acabar esto
                    // Da valor a respuesta
                    await repositorio.conexion()
                        .then((db) => repositorio.insertarUsuario(db, usuario))
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
                path: '/registro',
                handler: async (req, h) => {
                    return h.view('registro',
                        { },
                        { layout: 'base'});
                }
            },
            {
                method: 'POST',
                path: '/publicar',
                // Options of the handlers, we specify
                options : {
                    auth: 'auth-registrado',
                    payload: {
                        output: 'stream'
                    }
                },
                handler: async (req, h) => {
                    // Parse form data
                    anuncio = {
                        usuario: req.auth.credentials ,
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
                                idAnuncio = id;
                            }
                        })
                    // Once inserted the ad...
                    binario = req.payload.foto._data; // photo binary
                    extension = req.payload.foto.hapi.filename.split('.')[1]; // photo extension
                    // Upload the photo with the same name as the ad identifier.
                    // module exports.funtion to call functions in the module itself
                    if (req.payload.foto){
                        await module.exports.utilSubirFichero(
                            binario, idAnuncio, extension);
                    }

                    return respuesta;
                }
            },
            {
                method: 'GET',
                path: '/publicar',
                options: {
                    auth: 'auth-registrado'
                },
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
                    var criterio = {};
                    if (req.query.criterio != null ){
                        criterio = { "titulo" : {$regex : ".*"+req.query.criterio.trim()+".*"}};
                    }

                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerAnuncios(db, criterio))
                        .then((anuncios) => {
                            anunciosEjemplo = anuncios;
                        })
                    // Recorte de longitud de titulos y descripciones
                    anunciosEjemplo.forEach( (e) => {
                        if (e.titulo.length > 25){
                            e.titulo = e.titulo.substring(0, 25) + "...";
                        }
                        if (e.descripcion.length > 80) {
                            e.descripcion = e.descripcion.substring(0, 80) + "...";;
                        }
                    });

                    return h.view(
                        'anuncios', // html principal
                        { // data for the template
                            usuario: 'ragna',
                            anuncios: anunciosEjemplo
                        },
                        { // which layout
                            layout: 'base'
                        } );
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
