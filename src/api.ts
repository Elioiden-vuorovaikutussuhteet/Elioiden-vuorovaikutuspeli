export async function login(password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ password })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data;
}

export async function checkAuth() {
  const response = await fetch("/api/auth/me", {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Could not check authentication");
  }

  return response.json();
}

export async function logout() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }

  return response.json();
}

export async function getServerMessage() {
  const response = await fetch("/api/hello");

  if (!response.ok) {
    throw new Error("Failed to contact server");
  }

  return response.json();
}