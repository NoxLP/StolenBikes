# StolenBikes back-end API

StolenBikes back-end API for Advance Digital Experts challenge.

## Installation and local run

The API is uploaded to heroku on \_\_(TODO: fill this when heroku app is running).

Dev and production databases have been created at Mongo Atlas, I'll pass .env files for both by email.

For both of them, a npm script will run automatically to seed the chosen database using [mongoose-seed](https://www.npmjs.com/package/mongoose-seed) package before the server start.

Also, if you want to run it all locally I've used [run-rs](https://www.npmjs.com/package/run-rs) package, which will download and install a local MongoDB replica set(mongoose transactions need a replica set) independent from any other mongo installation you could have in your computer (won't overwrite a thing). Although I haven't been able to use the seeding script this way, so you'd need to run the seeding script manually once run-rs mongo database is running.

So...

As usual, first:

`npm i`

Then:

### Production Mongo Atlas

1. First time you run the server you'll need to copy `.env` files to `./env` folder.
2. `npm start`

### Development Mongo Atlas

1. First time you run the server you'll need to copy `.env` files to `./env` folder.
2. `npm run start:dev`

### Local

1. `npm run start:local`
2. Run-rs can last for a few minutes since it needs to download MongoDB, so wait for it. When it's finished, it will send this message to the console:
   `Started replica set on "mongodb://localhost:27017,localhost:27018,localhost:27019?replicaSet=rs"`
3. `node -r dotenv/config ./seed.js dotenv_config_path=env/local.env`
4. You only need steps 2 and 3 the first time you run the server.
