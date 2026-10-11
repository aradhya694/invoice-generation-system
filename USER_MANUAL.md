# VKF Invoice Application - User Manual

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Login](#2-login)
3. [Invoice List](#3-invoice-list)
4. [Creating an Invoice](#4-creating-an-invoice)
5. [Editing an Invoice](#5-editing-an-invoice)
6. [Invoice Preview](#6-invoice-preview)
7. [Printing an Invoice](#7-printing-an-invoice)
8. [Downloading PDF](#8-downloading-pdf)

---

## 1. Getting Started

Open your browser and navigate to `http://localhost:5173`. You will see the login page.

---

## 2. Login

1. Enter your **Username** and **Password**
   - Default credentials: `admin` / `admin123`
2. Click **Login**
3. On successful login, you are redirected to the invoice list

To log out, click the **Logout** button in the top-right corner of the navigation bar.

---

## 3. Invoice List

The invoice list page shows all invoices in a table with the following columns:

| Column      | Description                                |
|-------------|--------------------------------------------|
| Invoice #   | Auto-generated invoice number              |
| Customer    | Customer name                              |
| Date        | Invoice date                               |
| GST Type    | IGST (blue badge) or CGST+SGST (green badge) |
| Subtotal    | Total taxable amount                       |
| Discount    | Total discount amount                      |
| Grand Total | Final amount including taxes               |
| Actions     | View and Edit buttons                      |

### Actions

- **+ New Invoice** (top right) - Opens the invoice creation form
- **View** - Opens the invoice preview with print and PDF options
- **Edit** - Opens the invoice in edit mode

---

## 4. Creating an Invoice

1. Click **+ New Invoice** from the invoice list page
2. Fill in the form:

### Customer Section
- **Customer** - Select a customer from the dropdown. Their address, GSTIN, and state will display automatically.
- **Invoice Date** - Defaults to today. Change if needed.
- **GST Type** - Toggle between:
  - **CGST + SGST** - For intra-state transactions (same state)
  - **IGST** - For inter-state transactions (different states)

### Line Items
- Select a **Product** from the dropdown. HSN code, unit, unit price, and GST rate fill automatically.
- Enter **Quantity** (minimum 0.01)
- Enter **Discount %** (0-100) if applicable
- The following are calculated automatically:
  - Taxable Amount = (Qty x Unit Price) - Discount
  - GST Amount = Taxable Amount x GST Rate
  - Total = Taxable Amount + GST Amount
- Click **+ Add Item** to add more line items
- Click **Remove** to delete a line item (at least one item is required)

### Summary
The summary section at the bottom shows:
- Subtotal (total taxable amount across all items)
- Total Discount
- CGST / SGST (if CGST+SGST mode) or IGST (if IGST mode)
- **Grand Total**

### Saving
- Click **Save Invoice** to create the invoice
- Click **Cancel** to discard and return to the list
- The invoice number is generated automatically (format: INV-YYYYMMDD-XXXX)

---

## 5. Editing an Invoice

1. From the invoice list, click **Edit** on the invoice you want to modify
2. The form loads with all existing data pre-populated:
   - Customer selection
   - Invoice date
   - GST type
   - All line items with quantities, discounts, etc.
3. Make your changes:
   - Change customer, date, or GST type
   - Modify quantities or discount percentages
   - Add or remove line items
4. Click **Update Invoice** to save changes
5. The invoice number remains unchanged after editing

---

## 6. Invoice Preview

1. From the invoice list, click **View** on any invoice
2. The preview shows a professional tax invoice template with:

### Header
- Company name, address, GSTIN, and contact details
- "TAX INVOICE" title
- Invoice number and date

### Customer Details
- Bill To section with customer name, address, and GSTIN
- GST type indicator

### Items Table
- All line items with serial number, product name, HSN code, quantity, unit price, discount percentage, taxable amount, GST rate, GST amount, and total

### Summary
- Subtotal
- Discount (if any)
- Tax breakdown (CGST+SGST or IGST)
- Grand Total

### Footer
- Terms and conditions
- Authorized signatory section

### Action Buttons (top of page)
- **Back** - Return to invoice list
- **Edit** - Open this invoice in edit mode
- **Print** - Open browser print dialog
- **Download PDF** - Generate and download PDF file

---

## 7. Printing an Invoice

1. Open the invoice preview (click **View** from the list)
2. Click the **Print** button in the action bar
3. Your browser's print dialog will open
4. The print layout automatically:
   - Hides the navigation bar
   - Hides the action buttons (Back, Edit, Print, Download PDF)
   - Removes card borders and shadows
   - Shows only the clean invoice template
5. Select your printer and click Print

**Tip:** You can also use the keyboard shortcut `Ctrl+P` while on the preview page.

---

## 8. Downloading PDF

1. Open the invoice preview (click **View** from the list)
2. Click the **Download PDF** button
3. The button will show "Generating..." while the PDF is being created
4. The PDF file downloads automatically with the filename `{invoice_number}.pdf` (e.g., `INV-20260204-0001.pdf`)

### PDF Specifications
- A4 page size (portrait orientation)
- High resolution (2x scale capture)
- Automatic multi-page support for invoices with many line items
- Includes all sections: header, customer details, items table, summary, and footer

---

## Tips

- **GST Type Selection**: Choose CGST+SGST for customers in the same state as your company. Choose IGST for customers in a different state.
- **Discount**: Enter discount as a percentage per line item. The discount is applied before tax calculation.
- **Invoice Numbers**: Numbers are auto-generated and sequential within each day. They cannot be changed.
- **Browser Compatibility**: PDF generation and printing work best in Chrome, Edge, and Firefox.
