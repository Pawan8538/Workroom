import { useState, useEffect } from 'react';

export const useAgents = () => {
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    // Fetch initial agents or setup socket listeners
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents');
        const data = await response.json();
        setAgents(data);
      } catch (err) {
        console.error("Failed to fetch agents", err);
      }
    };

    fetchAgents();
  }, []);

  return { agents };
};
