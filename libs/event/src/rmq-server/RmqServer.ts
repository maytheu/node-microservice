import { Channel, connect, Connection } from 'amqplib';
import { validate } from '@app/core';
import { Queue } from './types';

type HandlerCB = (msg: string) => any;

class RabbitMQConnection {
  connection!: Connection;
  channel!: Channel;
  private connected!: Boolean;

  async connect() {
    if (this.connected && this.channel) return;
    else this.connected = true;

    try {
      console.log(`⌛️ Connecting to Rabbit-MQ Server`);
      this.connection = await connect(validate.MQ_SERVER);

      console.log(`✅ Rabbit MQ Connection is ready`);

      this.channel = await this.connection.createChannel();

      console.log(`🛸 Created RabbitMQ Channel successfully`);

      this.connected = true;
    } catch (error) {
      console.error(error);
      console.error(`Not connected to MQ Server`);
    }
  }

  async sendToQueue(queue: Queue, message: any) {
    try {
      if (!this.channel) {
        await this.connect();
      }

      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async consume(queue: Queue, handleIncomingNotification: HandlerCB) {
    await this.channel.assertQueue(queue, {
      durable: true,
    });

    this.channel.consume(
      queue,
      (msg) => {
        {
          if (!msg) {
            return console.error(`Invalid incoming message`);
          }

          handleIncomingNotification(msg?.content?.toString());

          this.channel.ack(msg);
        }
      },
      {
        noAck: false,
      }
    );
  }
}

const mqConnection = new RabbitMQConnection();

export default mqConnection;
