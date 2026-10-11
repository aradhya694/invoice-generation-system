import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { customers, products } from '../data/staticData';
import InvoiceItemRow, { recalcItem } from '../components/InvoiceItemRow';

const emptyItem = {
  productId: '',
  product_name: '',
  hsn_code: '',
  quantity: 1,
  unit_price: 0,
  unit: '',
  discount_percent: 0,
  gst_rate: 0,
  taxable_amount: 0,
  gst_amount: 0,
  cgst: 0,
  sgst: 0,
  igst: 0,
  total: 0,
};

function CreateInvoicePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [customerId, setCustomerId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [gstType, setGstType] = useState('CGST_SGST');
  const [items, setItems] = useState([{ ...emptyItem }]);

  const selectedCustomer = customers.find((c) => c.id === parseInt(customerId, 10));

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    api.get(`/api/invoices/${id}`)
      .then((res) => {
        const inv = res.data;
        const customer = customers.find((c) => c.name === inv.customer_name);
        if (customer) setCustomerId(String(customer.id));
        setInvoiceDate(inv.invoice_date ? inv.invoice_date.slice(0, 10) : '');
        setGstType(inv.gst_type);
        const mappedItems = inv.items.map((dbItem) => {
          const product = products.find((p) => p.name === dbItem.product_name);
          return recalcItem({
            productId: product ? product.id : '',
            product_name: dbItem.product_name,
            hsn_code: dbItem.hsn_code,
            quantity: parseFloat(dbItem.quantity),
            unit_price: parseFloat(dbItem.unit_price),
            unit: product ? product.unit : '',
            discount_percent: parseFloat(dbItem.discount_percent),
            gst_rate: parseFloat(dbItem.gst_rate),
            taxable_amount: 0,
            gst_amount: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            total: 0,
          }, inv.gst_type);
        });
        setItems(mappedItems.length > 0 ? mappedItems : [{ ...emptyItem }]);
      })
      .catch(() => setError('Failed to load invoice'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleCustomerChange = (e) => {
    setCustomerId(e.target.value);
  };

  const handleGstTypeChange = (type) => {
    setGstType(type);
    setItems((prev) => prev.map((item) => recalcItem(item, type)));
  };

  const handleItemChange = (index, updated) => {
    setItems((prev) => prev.map((it, i) => (i === index ? updated : it)));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { ...emptyItem }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Summary calculations
  const subtotal = items.reduce((s, it) => s + (it.taxable_amount || 0), 0);
  const totalDiscount = items.reduce((s, it) => {
    const line = (it.quantity || 0) * (it.unit_price || 0);
    return s + line * ((it.discount_percent || 0) / 100);
  }, 0);
  const totalCgst = items.reduce((s, it) => s + (it.cgst || 0), 0);
  const totalSgst = items.reduce((s, it) => s + (it.sgst || 0), 0);
  const totalIgst = items.reduce((s, it) => s + (it.igst || 0), 0);
  const grandTotal = items.reduce((s, it) => s + (it.total || 0), 0);

  const round2 = (n) => Math.round(n * 100) / 100;
  const formatNum = (n) =>
    (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!customerId) {
      setError('Please select a customer');
      return;
    }
    if (!items.some((it) => it.productId)) {
      setError('Please add at least one product');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customer_name: selectedCustomer.name,
        customer_address: selectedCustomer.address,
        customer_gstin: selectedCustomer.gstin,
        invoice_date: invoiceDate,
        gst_type: gstType,
        subtotal: round2(subtotal),
        discount_amount: round2(totalDiscount),
        cgst_amount: round2(totalCgst),
        sgst_amount: round2(totalSgst),
        igst_amount: round2(totalIgst),
        grand_total: round2(grandTotal),
        items: items
          .filter((it) => it.productId)
          .map((it) => ({
            product_name: it.product_name,
            hsn_code: it.hsn_code,
            quantity: it.quantity,
            unit_price: it.unit_price,
            discount_percent: it.discount_percent,
            taxable_amount: it.taxable_amount,
            gst_rate: it.gst_rate,
            gst_amount: it.gst_amount,
            total: it.total,
          })),
      };

      if (isEdit) {
        await api.put(`/api/invoices/${id}`, payload);
      } else {
        await api.post('/api/invoices', payload);
      }
      navigate('/invoices');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <div className="page-header">
        <h2>{isEdit ? 'Edit Invoice' : 'Create Invoice'}</h2>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-body">
            <div className="form-row">
              <div className="form-group flex-2">
                <label className="label">Customer</label>
                <select value={customerId} onChange={handleCustomerChange} className="input" required>
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group flex-1">
                <label className="label">Invoice Date</label>
                <input
                  type="date"
                  className="input"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group flex-1">
                <label className="label">GST Type</label>
                <div className="toggle-group">
                  <button
                    type="button"
                    className={`toggle-btn ${gstType === 'CGST_SGST' ? 'active' : ''}`}
                    onClick={() => handleGstTypeChange('CGST_SGST')}
                  >
                    CGST + SGST
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${gstType === 'IGST' ? 'active' : ''}`}
                    onClick={() => handleGstTypeChange('IGST')}
                  >
                    IGST
                  </button>
                </div>
              </div>
            </div>
            {selectedCustomer && (
              <div className="customer-info">
                <span><strong>Address:</strong> {selectedCustomer.address}</span>
                <span><strong>GSTIN:</strong> {selectedCustomer.gstin}</span>
                <span><strong>State:</strong> {selectedCustomer.state}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-header">
            <h3>Line Items</h3>
            <button type="button" onClick={addItem} className="btn btn-secondary btn-sm">
              + Add Item
            </button>
          </div>
          <div className="table-wrapper">
            <table className="table table-compact">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>HSN</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th className="text-right">Unit Price</th>
                  <th>Disc %</th>
                  <th className="text-right">Taxable Amt</th>
                  <th className="text-right">GST Rate</th>
                  <th className="text-right">GST Amt</th>
                  <th className="text-right">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <InvoiceItemRow
                    key={idx}
                    item={item}
                    index={idx}
                    gstType={gstType}
                    onChange={handleItemChange}
                    onRemove={removeItem}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-body">
            <div className="summary-grid">
              <div className="summary-row">
                <span>Subtotal (Taxable Amount)</span>
                <span className="font-medium">{formatNum(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Total Discount</span>
                <span className="text-red">{formatNum(totalDiscount)}</span>
              </div>
              {gstType === 'CGST_SGST' ? (
                <>
                  <div className="summary-row">
                    <span>CGST</span>
                    <span>{formatNum(totalCgst)}</span>
                  </div>
                  <div className="summary-row">
                    <span>SGST</span>
                    <span>{formatNum(totalSgst)}</span>
                  </div>
                </>
              ) : (
                <div className="summary-row">
                  <span>IGST</span>
                  <span>{formatNum(totalIgst)}</span>
                </div>
              )}
              <div className="summary-row summary-total">
                <span>Grand Total</span>
                <span>{formatNum(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions mt-4">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/invoices')}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Invoice' : 'Save Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateInvoicePage;
