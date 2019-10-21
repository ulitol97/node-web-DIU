module.exports = {
    // Hapi needs a name for the module
    name: 'MiRouter',
    // Register function is run the moment hapi inserts the module
    register: async (server, options) => {
        server.route([
            {
                method: 'GET',
                path: '/',
                handler: async (req, h) => {
                    return 'Hola Mundo';
                }
            }
        ])
    }
}
