const pool = require('../config/db');

// Generate invoice number: INV-YYYYMMDD-XXXX
async function generateInvoiceNumber(client) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `INV-${dateStr}-`;

  const result = await client.query(
    "SELECT invoice_number FROM invoices WHERE invoice_number LIKE $1 ORDER BY invoice_number DESC LIMIT 1",
    [prefix + '%']
  );

  let seq = 1;
  if (result.rows.length > 0) {
    const last = result.rows[0].invoice_number;
    seq = parseInt(last.split('-')[2], 10) + 1;
  }

  return `${prefix}${String(seq).padStart(4, '0')}`;
}

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, invoice_number, customer_name, invoice_date, gst_type,
              subtotal, discount_amount, grand_total, created_at
       FROM invoices ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get invoices error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoiceResult = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const itemsResult = await pool.query(
      'SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY id',
      [id]
    );

    res.json({
      ...invoiceResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (err) {
    console.error('Get invoice error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const {
      customer_name, customer_address, customer_gstin, invoice_date, gst_type,
      subtotal, discount_amount, cgst_amount, sgst_amount, igst_amount, grand_total,
      items,
    } = req.body;

    if (!customer_name || !gst_type || !items || items.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Customer, GST type, and at least one item are required' });
    }

    // Verify invoice exists
    const existing = await client.query('SELECT id FROM invoices WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Update header (invoice_number and created_by remain unchanged)
    const invoiceResult = await client.query(
      `UPDATE invoices SET
         customer_name = $1, customer_address = $2, customer_gstin = $3,
         invoice_date = $4, gst_type = $5, subtotal = $6, discount_amount = $7,
         cgst_amount = $8, sgst_amount = $9, igst_amount = $10, grand_total = $11
       WHERE id = $12
       RETURNING *`,
      [
        customer_name, customer_address || '', customer_gstin || '',
        invoice_date || new Date(), gst_type,
        subtotal, discount_amount, cgst_amount, sgst_amount, igst_amount, grand_total,
        id,
      ]
    );

    const invoice = invoiceResult.rows[0];

    // Delete old items and insert new ones
    await client.query('DELETE FROM invoice_items WHERE invoice_id = $1', [id]);

    for (const item of items) {
      await client.query(
        `INSERT INTO invoice_items
           (invoice_id, product_name, hsn_code, quantity, unit_price, discount_percent,
            taxable_amount, gst_rate, gst_amount, total)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          invoice.id, item.product_name, item.hsn_code || '', item.quantity,
          item.unit_price, item.discount_percent || 0,
          item.taxable_amount, item.gst_rate, item.gst_amount, item.total,
        ]
      );
    }

    await client.query('COMMIT');

    res.json(invoice);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update invoice error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

exports.create = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      customer_name, customer_address, customer_gstin, invoice_date, gst_type,
      subtotal, discount_amount, cgst_amount, sgst_amount, igst_amount, grand_total,
      items,
    } = req.body;

    if (!customer_name || !gst_type || !items || items.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Customer, GST type, and at least one item are required' });
    }

    const invoice_number = await generateInvoiceNumber(client);

    const invoiceResult = await client.query(
      `INSERT INTO invoices
         (invoice_number, customer_name, customer_address, customer_gstin, invoice_date, gst_type,
          subtotal, discount_amount, cgst_amount, sgst_amount, igst_amount, grand_total, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        invoice_number, customer_name, customer_address || '', customer_gstin || '',
        invoice_date || new Date(), gst_type,
        subtotal, discount_amount, cgst_amount, sgst_amount, igst_amount, grand_total,
        req.user.id,
      ]
    );

    const invoice = invoiceResult.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO invoice_items
           (invoice_id, product_name, hsn_code, quantity, unit_price, discount_percent,
            taxable_amount, gst_rate, gst_amount, total)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          invoice.id, item.product_name, item.hsn_code || '', item.quantity,
          item.unit_price, item.discount_percent || 0,
          item.taxable_amount, item.gst_rate, item.gst_amount, item.total,
        ]
      );
    }

    await client.query('COMMIT');

    res.status(201).json(invoice);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create invoice error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};
