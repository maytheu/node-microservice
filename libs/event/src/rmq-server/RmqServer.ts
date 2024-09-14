import { Channel, connect, Connection } from 'amqplib';
import { validate } from '@app/core';
import { Queue } from './types';

type HandlerCB = (msg: string) => any;

class RabbitMQConnection {
  connection!: Connection;
  channel!: Channel;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  async connect() {
    if (this.connected && this.channel) return;

    try {
      console.log(`⌛️ Connecting to Rabbit-MQ Server`);
      this.connection = await connect(validate.MQ_SERVER);

      this.connection.on('error', async (err) => {
        console.error('Connection error:', err);
        this.connected = false;
        await this.reconnect();
      });

      this.connection.on('close', async () => {
        console.warn('RabbitMQ connection closed');
        this.connected = false;
        await this.reconnect();
      });

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
      if (!this.connected || !this.channel) {
        await this.connect();
      }

      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async consume(
    queue: Queue,
    handleIncomingNotification: HandlerCB,
    tag?: string
  ) {
    if (!this.connected || !this.channel) {
      await this.connect();
    }
    await this.channel.assertQueue(queue, {
      durable: true,
    });

    this.channel.consume(
      queue,
      async (msg) => {
        {
          if (!msg) {
            return console.error(`Invalid incoming message`);
          }

          await handleIncomingNotification(msg?.content?.toString());

          this.channel.ack(msg);
        }
      },
      {
        noAck: false,
        consumerTag: tag,
        exclusive: true,
      }
    );
  }

  private async closeConnection() {
    try {
      if (this.channel) {
        await this.channel.close();
        console.log('RabbitMQ channel closed');
      }

      if (this.connection) {
        await this.connection.close();
        console.log('RabbitMQ connection closed');
      }

      this.connected = false;
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
    }
  }

  private async reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached. Giving up.');
      return;
    }

    this.reconnectAttempts++;
    const backoffTime = Math.min(1000 * this.reconnectAttempts, 10000);

    console.log(
      `⚠️ Reconnecting in ${backoffTime / 1000} seconds... (Attempt ${
        this.reconnectAttempts
      })`
    );

    await new Promise((resolve) => setTimeout(resolve, backoffTime));

    await this.connect();
  }
}

const mqConnection = new RabbitMQConnection();

export default mqConnection;
