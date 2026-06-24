const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'helpdesk-backend',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();

async function connectProducer() {
  try {
    await producer.connect();
    console.log('Kafka producer connected');
  } catch (error) {
    console.error('Kafka producer connection failed:', error.message);
    console.log('Kafka producer will be disabled');
  }
}

async function publishEvent(topic, event) {
  try {
    await producer.send({
      topic,
      messages: [
        {
          key: String(event.data?.id || Date.now()),
          value: JSON.stringify({
            ...event,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
    console.log(`Event published to ${topic}:`, event.event);
  } catch (error) {
    console.error('Failed to publish event:', error.message);
  }
}

module.exports = { connectProducer, publishEvent };
