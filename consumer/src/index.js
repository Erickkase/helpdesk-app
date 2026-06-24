const { Kafka } = require('kafkajs');
const { Pool } = require('pg');
require('dotenv').config();

const kafka = new Kafka({
  clientId: 'helpdesk-consumer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://helpdesk:helpdesk123@localhost:5432/helpdeskdb',
});

const WEBHOOK_URL = process.env.WEBHOOK_URL || '';

const consumer = kafka.consumer({ groupId: 'helpdesk-consumer-group' });

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS event_logs (
      id SERIAL PRIMARY KEY,
      event_type VARCHAR(50) NOT NULL,
      ticket_id INTEGER,
      payload JSONB NOT NULL,
      processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Event logs table ready');
}

async function callWebhook(event) {
  if (!WEBHOOK_URL) return;

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    console.log(`  -> Webhook called: ${response.status}`);
  } catch (error) {
    console.error(`  -> Webhook failed: ${error.message}`);
  }
}

async function processEvent(event) {
  const { event: eventType, data, timestamp } = event;

  console.log(`[${timestamp}] Processing event: ${eventType}`);
  console.log('Ticket data:', data);

  await pool.query(
    'INSERT INTO event_logs (event_type, ticket_id, payload) VALUES ($1, $2, $3)',
    [eventType, data.id, JSON.stringify(event)]
  );

  switch (eventType) {
    case 'TICKET_CREATED':
      console.log(`  -> New ticket #${data.id}: "${data.title}"`);
      break;
    case 'TICKET_STATUS_CHANGED':
      console.log(`  -> Ticket #${data.id} status changed to: ${data.status}`);
      break;
    default:
      console.log(`  -> Unknown event type: ${eventType}`);
  }

  await callWebhook(event);
}

async function startConsumer() {
  try {
    await initializeDatabase();

    await consumer.connect();
    console.log('Kafka consumer connected');

    await consumer.subscribe({ topic: 'ticket-events', fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          await processEvent(event);
        } catch (error) {
          console.error('Error processing message:', error.message);
        }
      },
    });
  } catch (error) {
    console.error('Consumer failed to start:', error.message);
    process.exit(1);
  }
}

startConsumer();
