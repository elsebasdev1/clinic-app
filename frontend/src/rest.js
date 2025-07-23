const BASE_URL = 'http://localhost:8081/backend/rest';

export async function getAppointments() {
  const res = await fetch(`${BASE_URL}/appointments`);
  return await res.json();
}

export async function createAppointment(data) {
  const res = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function getSpecialties() {
  const res = await fetch(`${BASE_URL}/specialties`);
  return await res.json();
}
