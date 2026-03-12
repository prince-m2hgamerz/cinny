import type { PremiumConfig, PremiumFeatureConfig, PremiumPlan } from '../hooks/useClientConfig';

export const PREMIUM_SETTINGS_EVENT_TYPE = 'org.vchat.premium_settings';
export const PREMIUM_REQUEST_EVENT_TYPE = 'org.vchat.premium_request';
export const PREMIUM_REQUEST_STATUS_EVENT_TYPE = 'org.vchat.premium_request_status';
const PREMIUM_SETTINGS_STORAGE_KEY = 'vchat.premiumSettings';

export type PremiumSettings = {
  monthlyPrice?: string;
  yearlyPrice?: string;
  yearlyDiscount?: string;
  features?: PremiumFeatureConfig[];
  updatedAt?: string;
  updatedBy?: string;
};

export type PremiumRequest = {
  eventId?: string;
  userId: string;
  plan: PremiumPlan;
  requestedAt: string;
  requestedBy?: string;
  note?: string;
};

export type PremiumRequestStatus = {
  userId: string;
  plan?: PremiumPlan;
  status: 'pending' | 'payment_requested' | 'approved' | 'rejected';
  amount?: string;
  currency?: string;
  note?: string;
  updatedAt?: string;
  updatedBy?: string;
};

export const DEFAULT_PREMIUM_FEATURES: PremiumFeatureConfig[] = [
  {
    key: 'badge',
    title: 'Premium badge',
    description: 'Stand out with a premium star next to your name.',
    icon: 'Star',
  },
  {
    key: 'speed',
    title: 'Faster uploads & downloads',
    description: 'Priority media transfers for premium members.',
    icon: 'Download',
  },
  {
    key: 'pins',
    title: 'More pinned chats',
    description: 'Keep more important conversations at the top.',
    icon: 'Pin',
  },
  {
    key: 'folders',
    title: 'More chat folders',
    description: 'Organize your chats with extra folders.',
    icon: 'Category',
  },
  {
    key: 'emoji',
    title: 'Animated emojis & stickers',
    description: 'Premium reactions and animated sticker packs.',
    icon: 'SmilePlus',
  },
  {
    key: 'themes',
    title: 'Custom themes',
    description: 'Personalize VChat with premium themes.',
    icon: 'Pencil',
  },
  {
    key: 'voice',
    title: 'Voice to text',
    description: 'Transcribe voice messages instantly.',
    icon: 'Mic',
  },
  {
    key: 'privacy',
    title: 'Advanced privacy controls',
    description: 'Extra visibility and privacy options.',
    icon: 'Shield',
  },
  {
    key: 'profile',
    title: 'Exclusive profile badges',
    description: 'Premium profile icons and longer bios.',
    icon: 'User',
  },
  {
    key: 'ads',
    title: 'Disable ads',
    description: 'Remove sponsored messages from your experience.',
    icon: 'EyeBlind',
  },
];

export const DEFAULT_PREMIUM_SETTINGS: PremiumSettings = {
  monthlyPrice: '₹299',
  yearlyPrice: '₹2499',
  yearlyDiscount: 'Save 30%',
  features: DEFAULT_PREMIUM_FEATURES,
};

export const normalizePremiumSettings = (value: unknown): PremiumSettings | null => {
  if (!value || typeof value !== 'object') return null;
  const data = value as PremiumSettings;
  const monthlyPrice =
    typeof data.monthlyPrice === 'string' && data.monthlyPrice.trim()
      ? data.monthlyPrice.trim()
      : undefined;
  const yearlyPrice =
    typeof data.yearlyPrice === 'string' && data.yearlyPrice.trim()
      ? data.yearlyPrice.trim()
      : undefined;
  const yearlyDiscount =
    typeof data.yearlyDiscount === 'string' && data.yearlyDiscount.trim()
      ? data.yearlyDiscount.trim()
      : undefined;
  const features = Array.isArray(data.features)
    ? data.features
        .filter((item) => item && typeof item === 'object')
        .map((item, index) => {
          const feature = item as PremiumFeatureConfig;
          const title =
            typeof feature.title === 'string' && feature.title.trim()
              ? feature.title.trim()
              : undefined;
          if (!title) return undefined;
          return {
            key:
              typeof feature.key === 'string' && feature.key.trim()
                ? feature.key.trim()
                : `${title}-${index}`,
            title,
            description:
              typeof feature.description === 'string' && feature.description.trim()
                ? feature.description.trim()
                : undefined,
            icon: feature.icon,
          };
        })
        .filter((item): item is PremiumFeatureConfig => !!item)
    : undefined;

  return {
    monthlyPrice,
    yearlyPrice,
    yearlyDiscount,
    features,
    updatedAt: data.updatedAt,
    updatedBy: data.updatedBy,
  };
};

const isPremiumPlan = (value: unknown): value is PremiumPlan =>
  value === 'monthly' || value === 'yearly' || value === 'lifetime' || value === 'trial';

export const normalizePremiumRequest = (
  value: unknown,
  fallbackUserId?: string,
  eventId?: string
): PremiumRequest | null => {
  if (!value || typeof value !== 'object') return null;
  const data = value as Partial<PremiumRequest>;
  const userId = typeof data.userId === 'string' ? data.userId.trim() : fallbackUserId;
  if (!userId) return null;
  const plan = isPremiumPlan(data.plan) ? data.plan : undefined;
  if (!plan) return null;
  const requestedAt =
    typeof data.requestedAt === 'string' && data.requestedAt.trim()
      ? data.requestedAt.trim()
      : new Date().toISOString();
  return {
    eventId,
    userId,
    plan,
    requestedAt,
    requestedBy: typeof data.requestedBy === 'string' ? data.requestedBy.trim() : undefined,
    note: typeof data.note === 'string' ? data.note.trim() : undefined,
  };
};

export const normalizePremiumRequestStatus = (
  value: unknown,
  fallbackUserId?: string
): PremiumRequestStatus | null => {
  if (!value || typeof value !== 'object') return null;
  const data = value as Partial<PremiumRequestStatus>;
  const userId = typeof data.userId === 'string' ? data.userId.trim() : fallbackUserId;
  if (!userId) return null;
  const status =
    data.status === 'pending' ||
    data.status === 'payment_requested' ||
    data.status === 'approved' ||
    data.status === 'rejected'
      ? data.status
      : undefined;
  if (!status) return null;
  return {
    userId,
    plan: isPremiumPlan(data.plan) ? data.plan : undefined,
    status,
    amount: typeof data.amount === 'string' ? data.amount.trim() : undefined,
    currency: typeof data.currency === 'string' ? data.currency.trim() : undefined,
    note: typeof data.note === 'string' ? data.note.trim() : undefined,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt.trim() : undefined,
    updatedBy: typeof data.updatedBy === 'string' ? data.updatedBy.trim() : undefined,
  };
};

export const computePremiumExpiry = (plan: PremiumPlan, fromDate = new Date()): string | undefined => {
  const date = new Date(fromDate);
  if (plan === 'monthly') {
    date.setDate(date.getDate() + 30);
    return date.toISOString();
  }
  if (plan === 'yearly') {
    date.setDate(date.getDate() + 365);
    return date.toISOString();
  }
  if (plan === 'trial') {
    date.setDate(date.getDate() + 7);
    return date.toISOString();
  }
  return undefined;
};

export const mergePremiumSettings = (
  base: PremiumSettings,
  override?: PremiumSettings | null
): PremiumSettings => ({
  monthlyPrice: override?.monthlyPrice ?? base.monthlyPrice,
  yearlyPrice: override?.yearlyPrice ?? base.yearlyPrice,
  yearlyDiscount: override?.yearlyDiscount ?? base.yearlyDiscount,
  features: override?.features ?? base.features,
  updatedAt: override?.updatedAt ?? base.updatedAt,
  updatedBy: override?.updatedBy ?? base.updatedBy,
});

export const loadPremiumSettings = (): PremiumSettings | null => {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PREMIUM_SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return normalizePremiumSettings(data);
  } catch {
    return null;
  }
};

export const savePremiumSettings = (settings: PremiumSettings): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PREMIUM_SETTINGS_STORAGE_KEY, JSON.stringify(settings, null, 2));
};

export const premiumConfigToSettings = (config?: PremiumConfig): PremiumSettings => ({
  monthlyPrice: config?.monthlyPrice ?? DEFAULT_PREMIUM_SETTINGS.monthlyPrice,
  yearlyPrice: config?.yearlyPrice ?? DEFAULT_PREMIUM_SETTINGS.yearlyPrice,
  yearlyDiscount: config?.yearlyDiscount ?? DEFAULT_PREMIUM_SETTINGS.yearlyDiscount,
  features: config?.features ?? DEFAULT_PREMIUM_SETTINGS.features,
});

export const parseFeatureList = (value: string): PremiumFeatureConfig[] => {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((title, index) => ({
      key: `${title.toLowerCase().replace(/\s+/g, '-')}-${index}`,
      title,
    }));
};

export const formatFeatureList = (features?: PremiumFeatureConfig[]): string => {
  if (!features || features.length === 0) return '';
  return features.map((feature) => feature.title).join(', ');
};
