import { API_BASE_URL } from '../config/api.js';

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

export async function askAI(prompt) {
  const res = await fetch(`${API_BASE_URL}/api/ask`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to get response");
  }

  return res.json();
}

export async function generateImage(prompt) {
  const res = await fetch(`${API_BASE_URL}/api/image`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ prompt }),
  });

  return res.json(); // Expect { imageUrl: "..." }
}

export async function removeBg(imageBlob) {
  const formData = new FormData();
  formData.append("image", imageBlob);
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}/api/remove-bg`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData,
  });

  return res.json(); // Returns { image, credits }
}

export async function getGiftIdeas(data) {
  const res = await fetch(`${API_BASE_URL}/api/gift-ideas`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to get gift ideas");
  }

  const result = await res.json();
  return result;
}

export async function claimDailyBonus() {
  const res = await fetch(`${API_BASE_URL}/api/auth/claim-daily-bonus`, {
    method: "POST",
    headers: getHeaders()
  });
  return res.json();
}
