const BASE_STYLE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 32px;
  background: #f8fafc;
  color: #1e293b;
`
const CARD_STYLE = `
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  margin: 16px 0;
`
const BUTTON_STYLE = `
  display: inline-block;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
`
const FOOTER_STYLE = `
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
  margin-top: 32px;
`

export function invoiceCreatedEmail(data: {
  invoiceNumber: string
  customerName: string
  total: number
  currency: string
  dueDate: string
  companyName: string
  dashboardUrl: string
}) {
  return `<!DOCTYPE html><html><body style="${BASE_STYLE}">
    <div style="${CARD_STYLE}">
      <h2 style="margin:0 0 8px">New Invoice Created</h2>
      <p style="color:#64748b;margin:0 0 24px">Invoice ${data.invoiceNumber} has been created for ${data.customerName}</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:8px 0;color:#64748b">Invoice Number</td><td style="padding:8px 0;font-weight:600">${data.invoiceNumber}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Customer</td><td style="padding:8px 0;font-weight:600">${data.customerName}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Amount</td><td style="padding:8px 0;font-weight:600;font-size:18px">${data.currency} ${data.total.toLocaleString()}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Due Date</td><td style="padding:8px 0;font-weight:600">${data.dueDate}</td></tr>
      </table>
      <a href="${data.dashboardUrl}" style="${BUTTON_STYLE}">View Invoice →</a>
    </div>
    <div style="${FOOTER_STYLE}">${data.companyName} · Powered by Nexlane</div>
  </body></html>`
}

export function paymentReceivedEmail(data: {
  invoiceNumber: string
  customerName: string
  amount: number
  currency: string
  companyName: string
  dashboardUrl: string
}) {
  return `<!DOCTYPE html><html><body style="${BASE_STYLE}">
    <div style="${CARD_STYLE}">
      <h2 style="margin:0 0 8px">💰 Payment Received</h2>
      <p style="color:#64748b;margin:0 0 24px">Payment for invoice ${data.invoiceNumber} from ${data.customerName}</p>
      <div style="text-align:center;margin:24px 0">
        <div style="font-size:36px;font-weight:700;color:#10b981">${data.currency} ${data.amount.toLocaleString()}</div>
      </div>
      <a href="${data.dashboardUrl}" style="${BUTTON_STYLE};background:#10b981">View Details →</a>
    </div>
    <div style="${FOOTER_STYLE}">${data.companyName} · Powered by Nexlane</div>
  </body></html>`
}

export function workLogApprovedEmail(data: {
  employeeName: string
  date: string
  hours: number
  projectName: string
  companyName: string
}) {
  return `<!DOCTYPE html><html><body style="${BASE_STYLE}">
    <div style="${CARD_STYLE}">
      <h2 style="margin:0 0 8px">✅ Work Log Approved</h2>
      <p style="color:#64748b;margin:0 0 24px">Your work log has been approved</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:8px 0;color:#64748b">Employee</td><td style="padding:8px 0;font-weight:600">${data.employeeName}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Date</td><td style="padding:8px 0;font-weight:600">${data.date}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Hours</td><td style="padding:8px 0;font-weight:600">${data.hours}h</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Project</td><td style="padding:8px 0;font-weight:600">${data.projectName}</td></tr>
      </table>
    </div>
    <div style="${FOOTER_STYLE}">${data.companyName} · Powered by Nexlane</div>
  </body></html>`
}

export function leaveRequestEmail(data: {
  employeeName: string
  type: string
  startDate: string
  endDate: string
  days: number
  reason: string
  companyName: string
  dashboardUrl: string
}) {
  return `<!DOCTYPE html><html><body style="${BASE_STYLE}">
    <div style="${CARD_STYLE}">
      <h2 style="margin:0 0 8px">📅 New Leave Request</h2>
      <p style="color:#64748b;margin:0 0 24px">${data.employeeName} has requested time off</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:8px 0;color:#64748b">Type</td><td style="padding:8px 0;font-weight:600">${data.type}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Duration</td><td style="padding:8px 0;font-weight:600">${data.startDate} → ${data.endDate} (${data.days} days)</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Reason</td><td style="padding:8px 0;font-weight:600">${data.reason}</td></tr>
      </table>
      <a href="${data.dashboardUrl}" style="${BUTTON_STYLE};background:#f59e0b">Review Request →</a>
    </div>
    <div style="${FOOTER_STYLE}">${data.companyName} · Powered by Nexlane</div>
  </body></html>`
}

export function purchaseOrderApprovedEmail(data: {
  orderNumber: string
  supplierName: string
  total: number
  currency: string
  companyName: string
  dashboardUrl: string
}) {
  return `<!DOCTYPE html><html><body style="${BASE_STYLE}">
    <div style="${CARD_STYLE}">
      <h2 style="margin:0 0 8px">📦 Purchase Order Approved</h2>
      <p style="color:#64748b;margin:0 0 24px">PO ${data.orderNumber} has been approved</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:8px 0;color:#64748b">PO Number</td><td style="padding:8px 0;font-weight:600">${data.orderNumber}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Supplier</td><td style="padding:8px 0;font-weight:600">${data.supplierName}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Total</td><td style="padding:8px 0;font-weight:600;font-size:18px">${data.currency} ${data.total.toLocaleString()}</td></tr>
      </table>
      <a href="${data.dashboardUrl}" style="${BUTTON_STYLE};background:#10b981">View Order →</a>
    </div>
    <div style="${FOOTER_STYLE}">${data.companyName} · Powered by Nexlane</div>
  </body></html>`
}

export function taskAssignedEmail(data: {
  taskTitle: string
  assignerName: string
  projectName: string
  dueDate: string | null
  companyName: string
  dashboardUrl: string
}) {
  return `<!DOCTYPE html><html><body style="${BASE_STYLE}">
    <div style="${CARD_STYLE}">
      <h2 style="margin:0 0 8px">📋 Task Assigned to You</h2>
      <p style="color:#64748b;margin:0 0 24px">${data.assignerName} assigned you a task</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:8px 0;color:#64748b">Task</td><td style="padding:8px 0;font-weight:600">${data.taskTitle}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Project</td><td style="padding:8px 0;font-weight:600">${data.projectName}</td></tr>
        ${data.dueDate ? `<tr><td style="padding:8px 0;color:#64748b">Due</td><td style="padding:8px 0;font-weight:600">${data.dueDate}</td></tr>` : ''}
      </table>
      <a href="${data.dashboardUrl}" style="${BUTTON_STYLE}">View Task →</a>
    </div>
    <div style="${FOOTER_STYLE}">${data.companyName} · Powered by Nexlane</div>
  </body></html>`
}
