import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function InvoicePreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const templateRef = useRef(null);

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api.get(`/api/invoices/${id}`)
      .then((res) => setInvoice(res.data))
      .catch(() => setError('Failed to load invoice'))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const formatCurrency = (n) =>
    parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!templateRef.current) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(templateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
      heightLeft -= (pageHeight - margin * 2);

      while (heightLeft > 0) {
        position = -(pageHeight - margin * 2) * (Math.ceil((imgHeight - heightLeft) / (pageHeight - margin * 2))) + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
        heightLeft -= (pageHeight - margin * 2);
      }

      pdf.save(`${invoice.invoice_number}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (error) return <div className="container"><div className="alert alert-error">{error}</div></div>;
  if (!invoice) return null;

  return (
    <div className="container">
      <div className="action-bar no-print">
        <button className="btn btn-outline" onClick={() => navigate('/invoices')}>Back</button>
        <div className="action-bar-right">
          <Link to={`/invoices/${id}/edit`} className="btn btn-secondary">Edit</Link>
          <button className="btn btn-outline" onClick={handlePrint}>Print</button>
          <button className="btn btn-primary" onClick={handleDownloadPDF} disabled={downloading}>
            {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      <div className="invoice-template" ref={templateRef}>
        {/* Company Header */}
        <div className="invoice-header">
          <div className="invoice-company">
            <h1 className="company-name">VKF Industries Pvt. Ltd.</h1>
            <p>123 Industrial Area, Phase II, Pune 411018</p>
            <p>GSTIN: 27AABCV1234M1ZP</p>
            <p>Phone: +91 20 2567 8900 | Email: billing@vkfindustries.com</p>
          </div>
          <div className="invoice-title-block">
            <h2 className="invoice-title">TAX INVOICE</h2>
            <div className="invoice-meta">
              <div><strong>Invoice #:</strong> {invoice.invoice_number}</div>
              <div><strong>Date:</strong> {formatDate(invoice.invoice_date)}</div>
            </div>
          </div>
        </div>

        <div className="invoice-divider"></div>

        {/* Customer Details */}
        <div className="invoice-parties">
          <div className="invoice-party">
            <h4>Bill To:</h4>
            <p className="party-name">{invoice.customer_name}</p>
            <p>{invoice.customer_address}</p>
            {invoice.customer_gstin && <p><strong>GSTIN:</strong> {invoice.customer_gstin}</p>}
          </div>
          <div className="invoice-party text-right">
            <h4>GST Type:</h4>
            <p className="party-name">{invoice.gst_type === 'IGST' ? 'IGST' : 'CGST + SGST'}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>HSN</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Unit Price</th>
              <th className="text-right">Disc %</th>
              <th className="text-right">Taxable Amt</th>
              <th className="text-right">GST %</th>
              <th className="text-right">GST Amt</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td>{item.product_name}</td>
                <td>{item.hsn_code}</td>
                <td className="text-right">{parseFloat(item.quantity)}</td>
                <td className="text-right">{formatCurrency(item.unit_price)}</td>
                <td className="text-right">{parseFloat(item.discount_percent)}%</td>
                <td className="text-right">{formatCurrency(item.taxable_amount)}</td>
                <td className="text-right">{parseFloat(item.gst_rate)}%</td>
                <td className="text-right">{formatCurrency(item.gst_amount)}</td>
                <td className="text-right">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* GST Summary */}
        <div className="invoice-summary">
          <div className="invoice-summary-table">
            <div className="invoice-summary-row">
              <span>Subtotal (Taxable Amount)</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {parseFloat(invoice.discount_amount) > 0 && (
              <div className="invoice-summary-row">
                <span>Total Discount</span>
                <span className="text-red">{formatCurrency(invoice.discount_amount)}</span>
              </div>
            )}
            {invoice.gst_type === 'CGST_SGST' ? (
              <>
                <div className="invoice-summary-row">
                  <span>CGST</span>
                  <span>{formatCurrency(invoice.cgst_amount)}</span>
                </div>
                <div className="invoice-summary-row">
                  <span>SGST</span>
                  <span>{formatCurrency(invoice.sgst_amount)}</span>
                </div>
              </>
            ) : (
              <div className="invoice-summary-row">
                <span>IGST</span>
                <span>{formatCurrency(invoice.igst_amount)}</span>
              </div>
            )}
            <div className="invoice-summary-row invoice-summary-total">
              <span>Grand Total</span>
              <span>{formatCurrency(invoice.grand_total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <div className="invoice-notes">
            <h4>Terms & Conditions:</h4>
            <p>1. Payment is due within 30 days of invoice date.</p>
            <p>2. Please include invoice number in payment reference.</p>
          </div>
          <div className="invoice-signature">
            <div className="signature-line"></div>
            <p>Authorized Signatory</p>
            <p className="company-stamp">VKF Industries Pvt. Ltd.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoicePreviewPage;
