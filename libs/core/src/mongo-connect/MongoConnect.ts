import mongoose from 'mongoose';

class MongoConnect {
  constructor() {
    mongoose.connection.once('open', () => console.log('Database connected'));
    mongoose.connection.on('error', async (e) => {
      console.log(e);
      await this.disconnectMongo();
    });
  }

  connectMongo = async (mongoUrl: string) => {
    await mongoose.connect(mongoUrl);
  };

  disconnectMongo = async () => {
    await mongoose.disconnect();
  };
}

export default new MongoConnect();
