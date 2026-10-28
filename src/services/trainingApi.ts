export interface Training {
  uid: string;
  week: number;
  dayofweek: number;
  activity: string;
  done: boolean;
}

export type TrainingInput = Omit<Training, 'uid'>;

const apiBaseUrl = (import.meta.env.VITE_GORUNNER_API_URL || '/api').replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `goRunner API returned ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function fetchTrainings(): Promise<Training[]> {
  const trainings = await request<Training[] | null>('/training');
  return trainings ?? [];
}

export function createTraining(training: TrainingInput): Promise<Training> {
  return request<Training>('/training', {
    method: 'POST',
    body: JSON.stringify(training),
  });
}

export function updateTraining(uid: string, training: TrainingInput): Promise<Training> {
  return request<Training>(`/training/${encodeURIComponent(uid)}`, {
    method: 'PUT',
    body: JSON.stringify(training),
  });
}

export function deleteTraining(uid: string): Promise<void> {
  return request<void>(`/training/${encodeURIComponent(uid)}`, { method: 'DELETE' });
}
