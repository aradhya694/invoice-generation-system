import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function InvoiceListPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/api/invoices');
      setInvoices(res.data);
    } catch (err) {
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN');
  const formatCurrency = (n) =>
    parseFloat(n).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <div className="page-header">
        <h2>Invoices</h2>
        <Link to="/invoices/new" className="btn btn-primary">+ New Invoice</Link>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {invoices.length === 0 ? (
        <div className="empty-state">
          <p>No invoices yet. Create your first invoice.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>GST Type</th>
                <th className="text-right">Subtotal</th>
                <th className="text-right">Discount</th>
                <th className="text-right">Grand Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="font-medium">{inv.invoice_number}</td>
                  <td>{inv.customer_name}</td>
                  <td>{formatDate(inv.invoice_date)}</td>
                  <td>
                    <span className={`badge ${inv.gst_type === 'IGST' ? 'badge-blue' : 'badge-green'}`}>
                      {inv.gst_type === 'IGST' ? 'IGST' : 'CGST+SGST'}
                    </span>
                  </td>
                  <td className="text-right">{formatCurrency(inv.subtotal)}</td>
                  <td className="text-right">{formatCurrency(inv.discount_amount)}</td>
                  <td className="text-right font-medium">{formatCurrency(inv.grand_total)}</td>
                  <td>
                    <div className="action-links">
                      <Link to={`/invoices/${inv.id}/preview`} className="btn btn-outline btn-sm">View</Link>
                      <Link to={`/invoices/${inv.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default InvoiceListPage;
