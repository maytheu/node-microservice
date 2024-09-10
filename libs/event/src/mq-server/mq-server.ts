import amqp from 'amqplib';
import { validate } from '@app/core';

export let channel, connection;

export async function mqServer(queue: string) {
  const amqpServer = validate.MQ_SERVER;
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue(queue);
}
