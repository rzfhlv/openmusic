require('dotenv').config();

const Hapi = require('@hapi/hapi');
const album = require('./api/album');
const song = require('./api/song');
const AlbumService = require('./services/postgres/AlbumService');
const AlbumValidator = require('./validator/album');
const SongService = require('./services/postgres/SongService');
const SongValidator = require('./validator/song');

const init = async () => {
    const albumService = new AlbumService();
    const songService = new SongService()

    const server = Hapi.server({
       port: process.env.PORT,
       host: process.env.HOST,
       routes: {
           cors: {
               origin: ['*'],
           },
       },
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return 'Hello World';
        }
    });

    await server.register([
        {
            plugin: album,
            options: {
                service: albumService,
                validator: AlbumValidator,
            },
        },
        {
            plugin: song,
            options: {
                service: songService,
                validator: SongValidator,
            },
        },
    ]);

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init()