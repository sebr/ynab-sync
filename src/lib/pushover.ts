import fetch, { Response } from "node-fetch";
import qs from "qs";

export interface PushoverOptions {
  user: string;
  token: string;
  title: string;
  message?: string;
  priority?: number;
  sound?: string;
}

export async function notify(opts: PushoverOptions) {
  const query = qs.stringify({
    token: opts.token,
    user: opts.user,
    message: opts.message || "Error",
    title: opts.title,
    priority: opts.priority || 0,
    sound: opts.sound || "cashregister"
  });

  const response = await fetch(`https://api.pushover.net/1/messages.json?${query}`, {
    method: "POST"
  });
  return status(response);
}

function status(response: Response) {
  if (response.status >= 200 && response.status < 300) {
    return response.json();
  } else {
    return Promise.reject(new Error(response.statusText));
  }
}
