export async function getServerMessage() {
  const response = await fetch('/api/hello');

  if (!response.ok) {
    throw new Error('Failed to contact server');
  }

  return response.json();
}