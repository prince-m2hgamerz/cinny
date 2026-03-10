import { trimTrailingSlash } from './common';

export type ReportTargetType = 'message' | 'user' | 'room' | 'space';

export type ReportPayload = {
  targetType: ReportTargetType;
  reason: string;
  details?: string;
  reporterUserId?: string;
  reporterDisplayName?: string;
  targetId: string;
  targetName?: string;
  targetUserId?: string;
  senderUserId?: string;
  eventId?: string;
  roomId?: string;
  roomName?: string;
  spaceId?: string;
  spaceName?: string;
  excerpt?: string;
  pageUrl?: string;
  appUrl?: string;
  origin?: string;
};

const getReportEndpoint = (): string =>
  `${trimTrailingSlash(window.location.origin)}${import.meta.env.BASE_URL}api/report`;

export const sendReport = async (payload: ReportPayload): Promise<void> => {
  const response = await fetch(getReportEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      pageUrl: payload.pageUrl ?? window.location.href,
      appUrl: payload.appUrl ?? `${trimTrailingSlash(window.location.origin)}${import.meta.env.BASE_URL}`,
      origin: payload.origin ?? window.location.origin,
    }),
  });

  if (!response.ok) {
    let errorMessage =
      response.status === 404
        ? 'Reporting endpoint is not available on this server'
        : 'Failed to submit report';

    try {
      const data = await response.json();
      if (typeof data?.error === 'string') {
        errorMessage = data.error;
      }
    } catch {
      // ignore response parse errors
    }

    throw new Error(errorMessage);
  }
};
