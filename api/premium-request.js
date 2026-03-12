import { MongoClient, ObjectId } from 'mongodb';

const MAX_FIELD_LENGTH = 512;
const MAX_NOTE_LENGTH = 1200;
const COOLDOWN_MS = 2 * 60 * 1000;
const ALLOWED_STATUS = new Set(['pending', 'payment_requested', 'approved', 'rejected']);
const ALLOWED_PLANS = new Set(['monthly', 'yearly', 'lifetime', 'trial']);

const sendJson = (res, statusCode, body) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
};

const trimValue = (value, maxLength = MAX_FIELD_LENGTH) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
};

const parseJsonBody = (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim()) return JSON.parse(req.body);
  return {};
};

const getMongoClient = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MongoDB is not configured');
  if (!globalThis.__vchatMongoClient) {
    globalThis.__vchatMongoClient = new MongoClient(uri, {
      maxPoolSize: 4,
    });
    globalThis.__vchatMongoClientPromise = globalThis.__vchatMongoClient.connect();
  }
  return globalThis.__vchatMongoClientPromise;
};

const getCollection = async () => {
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB || 'vchat';
  const collectionName = process.env.MONGODB_PREMIUM_COLLECTION || 'premium_requests';
  return client.db(dbName).collection(collectionName);
};

const toRequestRecord = (doc) => ({
  id: doc._id?.toString(),
  userId: doc.userId,
  plan: doc.plan,
  status: doc.status,
  amount: doc.amount,
  currency: doc.currency,
  note: doc.note,
  requestedAt: doc.requestedAt,
  requestedBy: doc.requestedBy,
  updatedAt: doc.updatedAt,
  updatedBy: doc.updatedBy,
});

const toStatus = (doc) => ({
  userId: doc.userId,
  plan: doc.plan,
  status: doc.status,
  amount: doc.amount,
  currency: doc.currency,
  note: doc.note,
  updatedAt: doc.updatedAt,
  updatedBy: doc.updatedBy,
});

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST' && req.method !== 'GET' && req.method !== 'PATCH') {
      res.setHeader('Allow', 'GET, POST, PATCH');
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }

    const collection = await getCollection();

    if (req.method === 'POST') {
      let body;
      try {
        body = parseJsonBody(req);
      } catch {
        sendJson(res, 400, { error: 'Invalid JSON body' });
        return;
      }

      const userId = trimValue(body.userId);
      const plan = trimValue(body.plan, 20);
      const note = trimValue(body.note, MAX_NOTE_LENGTH);
      const requestedBy = trimValue(body.requestedBy);

      if (!userId || !plan) {
        sendJson(res, 400, { error: 'Missing required fields' });
        return;
      }
      if (!ALLOWED_PLANS.has(plan)) {
        sendJson(res, 400, { error: 'Invalid premium plan' });
        return;
      }

      const now = new Date();
      const existing = await collection.findOne(
        { userId, status: 'pending' },
        { sort: { requestedAt: -1 } }
      );
      if (existing && existing.requestedAt) {
        const last = new Date(existing.requestedAt).getTime();
        if (!Number.isNaN(last) && now.getTime() - last < COOLDOWN_MS) {
          sendJson(res, 200, { ok: true, request: toRequestRecord(existing), status: toStatus(existing) });
          return;
        }
      }

      const doc = {
        userId,
        plan,
        status: 'pending',
        note,
        requestedAt: now.toISOString(),
        requestedBy: requestedBy || userId,
        updatedAt: now.toISOString(),
        updatedBy: requestedBy || userId,
      };
      const result = await collection.insertOne(doc);
      const saved = { ...doc, _id: result.insertedId };
      sendJson(res, 200, { ok: true, request: toRequestRecord(saved), status: toStatus(saved) });
      return;
    }

    if (req.method === 'GET') {
      const { userId, admin, limit } = req.query || {};
      const limitValue = Number.parseInt(limit, 10);
      const max = Number.isFinite(limitValue) && limitValue > 0 ? Math.min(limitValue, 200) : 100;
      if (userId) {
        const doc = await collection.findOne(
          { userId: String(userId) },
          { sort: { requestedAt: -1 } }
        );
        if (!doc) {
          sendJson(res, 200, { ok: true, status: null });
          return;
        }
        sendJson(res, 200, { ok: true, status: toStatus(doc) });
        return;
      }

      if (admin) {
        const docs = await collection.find({}).sort({ requestedAt: -1 }).limit(max).toArray();
        sendJson(res, 200, { ok: true, requests: docs.map(toRequestRecord) });
        return;
      }

      sendJson(res, 400, { error: 'Missing userId or admin flag' });
      return;
    }

    if (req.method === 'PATCH') {
      let body;
      try {
        body = parseJsonBody(req);
      } catch {
        sendJson(res, 400, { error: 'Invalid JSON body' });
        return;
      }

      const userId = trimValue(body.userId);
      const status = trimValue(body.status, 32);
      const plan = trimValue(body.plan, 20);
      const requestId = trimValue(body.requestId, 64);
      const amount = trimValue(body.amount, 64);
      const currency = trimValue(body.currency, 16);
      const note = trimValue(body.note, MAX_NOTE_LENGTH);
      const updatedBy = trimValue(body.updatedBy);

      if (!userId && !requestId) {
        sendJson(res, 400, { error: 'Missing userId or requestId' });
        return;
      }
      if (!status || !ALLOWED_STATUS.has(status)) {
        sendJson(res, 400, { error: 'Invalid status' });
        return;
      }
      if (plan && !ALLOWED_PLANS.has(plan)) {
        sendJson(res, 400, { error: 'Invalid premium plan' });
        return;
      }

      let objectId;
      if (requestId) {
        try {
          objectId = new ObjectId(requestId);
        } catch {
          sendJson(res, 400, { error: 'Invalid requestId' });
          return;
        }
      }
      const filter = objectId ? { _id: objectId } : { userId };
      const update = {
        status,
        amount,
        currency,
        note,
        updatedAt: new Date().toISOString(),
        updatedBy: updatedBy || userId,
      };
      if (plan) update.plan = plan;

      const result = await collection.findOneAndUpdate(
        filter,
        { $set: update },
        {
          sort: requestId ? undefined : { requestedAt: -1 },
          returnDocument: 'after',
        }
      );

      if (!result?.value) {
        sendJson(res, 404, { error: 'Request not found' });
        return;
      }

      sendJson(res, 200, { ok: true, status: toStatus(result.value) });
      return;
    }
  } catch (err) {
    sendJson(res, 500, { error: err instanceof Error ? err.message : 'Server error' });
  }
}
