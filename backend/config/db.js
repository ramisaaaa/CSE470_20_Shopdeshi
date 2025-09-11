const mongoose = require('mongoose');

let cachedUri = '';

const connectDb = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopdeshi';
  // Choose dbName explicitly to avoid defaulting to 'test'
  const envDbName = process.env.MONGODB_DB;
  // Try to infer db name from URI path if provided (mongodb+srv://.../<db>?)
  let uriDbName = '';
  try {
    const afterAt = MONGODB_URI.split('@').pop() || MONGODB_URI; // handle auth@
    const pathPart = afterAt.split('/')[1] || '';
    uriDbName = (pathPart || '').split('?')[0];
  } catch (_) {}
  const dbName = envDbName || uriDbName || 'shopdeshi';
  cachedUri = MONGODB_URI;
  // Log all Mongo operations in development to verify writes
  if (process.env.NODE_ENV !== 'production') {
    mongoose.set('debug', function (collectionName, method, query, doc) {
      console.log(`[DB DEBUG] ${collectionName}.${method}`, JSON.stringify(query), doc ? JSON.stringify(doc).slice(0, 200) : '');
    });
  }
  try {
    await mongoose.connect(MONGODB_URI, { dbName });
    console.log('[DB] MongoDB connected:', MONGODB_URI, 'dbName=', dbName);
  } catch (err) {
    console.error('[DB] MongoDB connection error:', err?.message);
    // Do not exit in dev; allow API to respond with diagnostics
  }
};

mongoose.connection.on('connected', () => console.log('[DB] connection: connected'));
mongoose.connection.on('error', (err) => console.error('[DB] connection error:', err?.message));
mongoose.connection.on('disconnected', () => console.warn('[DB] connection: disconnected'));

const getDbStatus = async () => {
  const conn = mongoose.connection;
  let pingOk = false;
  try {
    if (conn.db?.admin) {
      const res = await conn.db.admin().ping();
      pingOk = res?.ok === 1;
    }
  } catch (_) {}
  return {
    uri: cachedUri,
    readyState: conn.readyState, // 0=disconnected,1=connected,2=connecting,3=disconnecting
    name: conn.name,
    host: conn.host,
    pingOk,
    dbName: conn?.db?.databaseName
  };
};

module.exports = { connectDb, getDbStatus };


