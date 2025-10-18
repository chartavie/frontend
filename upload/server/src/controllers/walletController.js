const db = require('../utils/db');
const paynow = require('../services/paynowService');

async function createTopup(req, res) {
  const { userId, amountCents } = req.body;
  if (!userId || !amountCents || amountCents <= 0) return res.status(400).json({ error: 'invalid_input' });
  const reference = `wallet_topup_${userId}_${Date.now()}`;
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    // Ensure wallet exists
    const wRes = await client.query('SELECT id FROM wallets WHERE user_id=$1', [userId]);
    if (wRes.rowCount === 0) {
      await client.query('INSERT INTO wallets (id, user_id, balance_cents, currency, created_at, updated_at) VALUES (gen_random_uuid(), $1, 0, $2, now(), now())', [userId, process.env.DEFAULT_CURRENCY || 'ZWL']);
    }
    // Insert pending transaction
    await client.query(
      `INSERT INTO wallet_transactions (id, wallet_id, kind, amount_cents, currency, reference, meta, created_at)
       VALUES (gen_random_uuid(), (SELECT id FROM wallets WHERE user_id=$1), 'topup_pending', $2, $3, $4, $5, now())`,
      [userId, amountCents, process.env.DEFAULT_CURRENCY || 'ZWL', reference, JSON.stringify({ created_by: 'api' })]
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('createTopup db error', err);
    return res.status(500).json({ error: 'server_error' });
  } finally {
    client.release();
  }

  try {
    const pay = await paynow.createPayment({
      amount: (amountCents / 100).toFixed(2),
      reference,
      returnUrl: `${process.env.CLIENT_URL}/wallet/confirm?ref=${encodeURIComponent(reference)}`,
      items: [{ name: 'Wallet top-up', amount: (amountCents / 100).toFixed(2) }]
    });
    return res.json({ paymentUrl: pay.payment_url, pollUrl: pay.poll_url, reference });
  } catch (err) {
    console.error('createTopup gateway error', err);
    return res.status(500).json({ error: 'gateway_error', details: err.message });
  }
}

async function spend(req, res) {
  const { userId } = req.params;
  const { amountCents, reference } = req.body;
  if (!userId || !amountCents || amountCents <= 0) return res.status(400).json({ error: 'invalid_input' });
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const wRes = await client.query('SELECT id, balance_cents FROM wallets WHERE user_id=$1 FOR UPDATE', [userId]);
    if (wRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'wallet_not_found' });
    }
    const wallet = wRes.rows[0];
    if (wallet.balance_cents < amountCents) {
      await client.query('ROLLBACK');
      return res.status(402).json({ error: 'insufficient_funds' });
    }
    const newBal = wallet.balance_cents - amountCents;
    await client.query('UPDATE wallets SET balance_cents=$1, updated_at=now() WHERE id=$2', [newBal, wallet.id]);
    await client.query(
      `INSERT INTO wallet_transactions (id, wallet_id, kind, amount_cents, currency, reference, meta, created_at)
       VALUES (gen_random_uuid(), $1, 'spend', $2, $3, $4, $5, now())`,
      [wallet.id, amountCents, process.env.DEFAULT_CURRENCY || 'ZWL', reference || null, JSON.stringify({ created_by: 'spend_api' })]
    );
    await client.query('COMMIT');
    return res.json({ success: true, balanceCents: newBal });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('spend error', err);
    return res.status(500).json({ error: 'server_error' });
  } finally {
    client.release();
  }
}

async function refund(req, res) {
  const { userId } = req.params;
  const { amountCents, reference } = req.body;
  if (!userId || !amountCents || amountCents <= 0) return res.status(400).json({ error: 'invalid_input' });
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const wRes = await client.query('SELECT id, balance_cents FROM wallets WHERE user_id=$1 FOR UPDATE', [userId]);
    if (wRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'wallet_not_found' });
    }
    const wallet = wRes.rows[0];
    const newBal = wallet.balance_cents + amountCents;
    await client.query('UPDATE wallets SET balance_cents=$1, updated_at=now() WHERE id=$2', [newBal, wallet.id]);
    await client.query(
      `INSERT INTO wallet_transactions (id, wallet_id, kind, amount_cents, currency, reference, meta, created_at)
       VALUES (gen_random_uuid(), $1, 'refund', $2, $3, $4, $5, now())`,
      [wallet.id, amountCents, process.env.DEFAULT_CURRENCY || 'ZWL', reference || null, JSON.stringify({ created_by: 'refund_api' })]
    );
    await client.query('COMMIT');
    return res.json({ success: true, balanceCents: newBal });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('refund error', err);
    return res.status(500).json({ error: 'server_error' });
  } finally {
    client.release();
  }
}

async function getWallet(req, res) {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: 'invalid_input' });
  try {
    const wRes = await db.query('SELECT id, balance_cents, currency, created_at, updated_at FROM wallets WHERE user_id=$1', [userId]);
    if (wRes.rowCount === 0) return res.status(404).json({ error: 'wallet_not_found' });
    const wallet = wRes.rows[0];
    const txs = await db.query('SELECT id, kind, amount_cents, reference, meta, created_at FROM wallet_transactions WHERE wallet_id=$1 ORDER BY created_at DESC LIMIT 100', [wallet.id]);
    return res.json({ wallet, transactions: txs.rows });
  } catch (err) {
    console.error('getWallet error', err);
    return res.status(500).json({ error: 'server_error' });
  }
}

module.exports = { createTopup, spend, refund, getWallet };