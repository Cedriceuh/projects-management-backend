import { MongoMemoryServer } from 'mongodb-memory-server-core';

export = async function globalTeardown() {
  const instance: MongoMemoryServer = (global as any).__MONGOINSTANCE;
  await instance.stop();
};
