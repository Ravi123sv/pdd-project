const Datastore = require('nedb-promises');
const path = require('path');

const db = {
  users: Datastore.create({ filename: path.join(__dirname, 'data', 'users.db'), autoload: true }),
  patients: Datastore.create({ filename: path.join(__dirname, 'data', 'patients.db'), autoload: true }),
  assets: Datastore.create({ filename: path.join(__dirname, 'data', 'assets.db'), autoload: true }),
  sessions: Datastore.create({ filename: path.join(__dirname, 'data', 'sessions.db'), autoload: true })
};

module.exports = db;
