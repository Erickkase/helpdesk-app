import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function App() {
  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [health, setHealth] = useState('checking');

  async function loadTickets() {
    const response = await fetch(`${API_URL}/tickets`);
    const data = await response.json();
    setTickets(data);
  }

  async function checkHealth() {
    try {
      const response = await fetch(`${API_URL}/health`);
      const data = await response.json();
      setHealth(`${data.status} - database ${data.database}`);
    } catch {
      setHealth('backend not available');
    }
  }

  async function createTicket(event) {
    event.preventDefault();
    await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    });
    setTitle('');
    setDescription('');
    await loadTickets();
  }

  async function updateStatus(id, status) {
    await fetch(`${API_URL}/tickets/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    await loadTickets();
  }

  useEffect(() => {
    checkHealth();
    loadTickets();
  }, []);

  return (
    <main className="container">
      <section className="hero">
        <h1>Mini HelpDesk App</h1>
        <p>Practice project: branches, Docker, Docker Hub, Terraform, Load Balancer and ASG.</p>
        <span className="badge">Health: {health}</span>
      </section>

      <form className="card" onSubmit={createTicket}>
        <h2>Create ticket</h2>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ticket title" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ticket description" />
        <button type="submit">Create</button>
      </form>

      <section className="grid">
        {tickets.map((ticket) => (
          <article className="card" key={ticket.id}>
            <h3>#{ticket.id} {ticket.title}</h3>
            <p>{ticket.description}</p>
            <strong>Status: {ticket.status}</strong>
            <div className="actions">
              <button onClick={() => updateStatus(ticket.id, 'pending')}>Pending</button>
              <button onClick={() => updateStatus(ticket.id, 'in_progress')}>In progress</button>
              <button onClick={() => updateStatus(ticket.id, 'resolved')}>Resolved</button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
