import { trimTrailingSlash } from './common';
import type { PremiumPlan } from '../hooks/useClientConfig';
import type { PremiumRequestStatus } from './premium';

export type PremiumRequestRecord = {
  id?: string;
  userId: string;
  plan: PremiumPlan;
  status?: PremiumRequestStatus['status'];
  amount?: string;
  currency?: string;
  note?: string;
  requestedAt?: string;
  requestedBy?: string;
  updatedAt?: string;
  updatedBy?: string;
};

const getPremiumRequestEndpoint = (): string =>
  `${trimTrailingSlash(window.location.origin)}${import.meta.env.BASE_URL}api/premium-request`;

const parseJson = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const extractError = (data: any, fallback: string) =>
  typeof data?.error === 'string' ? data.error : fallback;

export const sendPremiumRequest = async (payload: {
  userId: string;
  plan: PremiumPlan;
  note?: string;
}): Promise<PremiumRequestStatus | null> => {
  const response = await fetch(getPremiumRequestEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await parseJson(response);
  if (!response.ok) {
    const fallback =
      response.status === 404
        ? 'Premium request API is not available on this server.'
        : 'Failed to submit premium request';
    throw new Error(extractError(data, fallback));
  }

  return (data?.status as PremiumRequestStatus) ?? null;
};

export const fetchPremiumRequestStatus = async (
  userId: string
): Promise<PremiumRequestStatus | null> => {
  const url = new URL(getPremiumRequestEndpoint());
  url.searchParams.set('userId', userId);
  const response = await fetch(url.toString(), { method: 'GET' });
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(extractError(data, 'Failed to load premium request status'));
  }
  return (data?.status as PremiumRequestStatus) ?? null;
};

export const fetchPremiumRequests = async (): Promise<PremiumRequestRecord[]> => {
  const url = new URL(getPremiumRequestEndpoint());
  url.searchParams.set('admin', '1');
  const response = await fetch(url.toString(), { method: 'GET' });
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(extractError(data, 'Failed to load premium requests'));
  }
  return Array.isArray(data?.requests) ? (data.requests as PremiumRequestRecord[]) : [];
};

export const updatePremiumRequestStatus = async (payload: {
  userId: string;
  status: PremiumRequestStatus['status'];
  plan?: PremiumPlan;
  amount?: string;
  currency?: string;
  note?: string;
  updatedBy?: string;
}): Promise<PremiumRequestStatus | null> => {
  const response = await fetch(getPremiumRequestEndpoint(), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(extractError(data, 'Failed to update premium request'));
  }
  return (data?.status as PremiumRequestStatus) ?? null;
};
