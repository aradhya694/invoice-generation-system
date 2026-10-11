import { products } from '../data/staticData';

function InvoiceItemRow({ item, index, gstType, onChange, onRemove }) {
  const handleProductChange = (e) => {
    const productId = parseInt(e.target.value, 10);
    const product = products.find((p) => p.id === productId);
    if (product) {
      const updated = {
        ...item,
        productId: product.id,
        product_name: product.name,
        hsn_code: product.hsnCode,
        unit_price: product.unitPrice,
        gst_rate: product.gstRate,
        unit: product.unit,
      };
      onChange(index, recalcItem(updated, gstType));
    }
  };

  const handleFieldChange = (field, value) => {
    const updated = { ...item, [field]: value };
    onChange(index, recalcItem(updated, gstType));
  };

  return (
    <tr>
      <td>{index + 1}</td>
      <td>
        <select
          value={item.productId || ''}
          onChange={handleProductChange}
          className="input"
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </td>
      <td>{item.hsn_code}</td>
      <td>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={item.quantity}
          onChange={(e) => handleFieldChange('quantity', parseFloat(e.target.value) || 0)}
          className="input input-sm"
        />
      </td>
      <td>{item.unit}</td>
      <td className="text-right">{formatNum(item.unit_price)}</td>
      <td>
        <input
          type="number"
          min="0"
          max="100"
          step="0.5"
          value={item.discount_percent}
          onChange={(e) => handleFieldChange('discount_percent', parseFloat(e.target.value) || 0)}
          className="input input-sm"
        />
      </td>
      <td className="text-right">{formatNum(item.taxable_amount)}</td>
      <td className="text-right">{item.gst_rate}%</td>
      <td className="text-right">{formatNum(item.gst_amount)}</td>
      <td className="text-right">{formatNum(item.total)}</td>
      <td>
        <button onClick={() => onRemove(index)} className="btn btn-danger btn-sm">Remove</button>
      </td>
    </tr>
  );
}

function recalcItem(item, gstType) {
  const qty = item.quantity || 0;
  const price = item.unit_price || 0;
  const discPct = item.discount_percent || 0;
  const gstRate = item.gst_rate || 0;

  const lineTotal = qty * price;
  const discountAmount = lineTotal * (discPct / 100);
  const taxable = lineTotal - discountAmount;

  let gstAmount = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (gstType === 'IGST') {
    igst = taxable * (gstRate / 100);
    gstAmount = igst;
  } else {
    cgst = taxable * (gstRate / 200);
    sgst = taxable * (gstRate / 200);
    gstAmount = cgst + sgst;
  }

  return {
    ...item,
    taxable_amount: round2(taxable),
    gst_amount: round2(gstAmount),
    cgst: round2(cgst),
    sgst: round2(sgst),
    igst: round2(igst),
    total: round2(taxable + gstAmount),
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function formatNum(n) {
  return (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export { recalcItem };
export default InvoiceItemRow;
