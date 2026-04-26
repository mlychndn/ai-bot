import { BASE_API_URL } from "../constants";

/**
 *
 * @param {*} message
 * @param {*} history
 * @returns
 *
 * Non-streaming chat functions
 * Sends a message and returns the complete response
 */
export async function chatApi(message, history) {
  try {
    const response = await fetch(`${BASE_API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch error", error);
  }
}

function shouldNotRetry(error) {
  const message = String(error?.message ?? "");
  return (
    message.includes("Authentication") ||
    message.includes("API key") ||
    message.includes("401")
  );
}

async function* retryWithBackoffStream(streamFactory, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      yield* streamFactory();
      return;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      if (shouldNotRetry(error) || isLastAttempt) {
        throw error;
      }

      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Streaming Chat functions
 * Yields chunks of the response as they arrive
 */

async function* streamRequest(message, history) {
  const controller = new AbortController();
  const timeOutId = setTimeout(() => {
    controller.abort();
  }, 60000);

  try {
    const response = await fetch(`${BASE_API_URL}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, history }),
      signal: controller.signal,
    });

    clearTimeout(timeOutId);

    if (!response.ok) {
      if (response.status === 500) {
        throw new Error("Server error, Please try again later.");
      } else if (response.status === 401) {
        throw new Error("Authentication failed. Check your API key.");
      } else if (response.status === 429) {
        throw new Error("Too many requests. Please wait a moment.");
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not iterable");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const jsonStr = line.slice(6);
            const data = JSON.parse(jsonStr);

            if (data.chunk) {
              yield data.chunk;
            }
          } catch (error) {
            console.error("Error parsing SSE data:", error);
          }
        }
      }
    }
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timeout. Please try again.");
    } else if (error.message.includes("Failed to fetch")) {
      throw new Error("Network Error. Check your internet connection.");
    } else {
      throw error;
    }
  } finally {
    clearTimeout(timeOutId);
  }
}

export async function* streamApi(message, history = []) {
  yield* retryWithBackoffStream(() => streamRequest(message, history), 3);
}
