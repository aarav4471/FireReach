const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export const runAgent = async (company, icp, email) => {
  console.log(`Connecting to FireReach API at: ${API_URL}/run-agent`);
  try {
    const response = await fetch(`${API_URL}/run-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company, icp, email }),
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error running agent:', error);
    throw error;
  }
};

export const discoverCompanies = async (icp) => {
  const response = await fetch(`${API_URL}/discover-companies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ icp }),
  });
  if (!response.ok) throw new Error("Failed to discover companies");
  return response.json();
};

export const getContacts = async (company) => {
  const response = await fetch(`${API_URL}/get-contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company }),
  });
  if (!response.ok) throw new Error("Failed to get contacts");
  return response.json();
};

export const generateEmail = async (company, icp, contact_name, contact_email) => {
  const response = await fetch(`${API_URL}/generate-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company, icp, contact_name, contact_email }),
  });
  if (!response.ok) throw new Error("Failed to generate email");
  return response.json();
};

export const sendEmail = async (to_email, subject, body) => {
  const response = await fetch(`${API_URL}/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to_email, subject, body }),
  });
  if (!response.ok) throw new Error("Failed to send email");
  return response.json();
};

export const generateManualEmail = async (email, company, icp) => {
  const response = await fetch(`${API_URL}/manual-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, company, icp }),
  });
  if (!response.ok) throw new Error("Failed to generate manual email");
  return response.json();
};

export const sendManualEmail = async (email, subject, body) => {
  const response = await fetch(`${API_URL}/send-manual-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, subject, body }),
  });
  if (!response.ok) throw new Error("Failed to send manual email");
  return response.json();
};
