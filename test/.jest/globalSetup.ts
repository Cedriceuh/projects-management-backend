import { MongoMemoryServer } from 'mongodb-memory-server-core';
import mongoose from 'mongoose';
import config from './config';

export = async function globalSetup() {
  const instance = await MongoMemoryServer.create();
  const uri = instance.getUri();
  (global as any).__MONGOINSTANCE = instance;
  process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/'));

  await mongoose.connect(`${process.env.MONGO_URI}/${config.database}`);
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
};
