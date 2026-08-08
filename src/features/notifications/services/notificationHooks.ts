import { createClient } from '@/core/supabase/server'
import { sendEmail } from './emailService'
import {
  invoiceCreatedEmail,
  paymentReceivedEmail,
  workLogApprovedEmail,
  leaveRequestEmail,
  taskAssignedEmail,
} from '../templates/emailTemplates'

const DASHBOARD_URL = 'https://nexlane-software.vercel.app/dashboard'

// ponytail: company name lookup is duplicated per hook. Extract when a 4th
// hook needs it; three copies is fine for now.

async function getCompanyName(companyId: string): Promise<string> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('companies')
    .select('name')
    .eq('id', companyId)
    .single()
  return data?.name ?? 'Nexlane'
}

export async function hookAfterInvoiceCreated(
  companyId: string,
  invoice: { invoice_number: string; total: number; currency: string; due_date: string },
  customerName: string,
) {
  try {
    const companyName = await getCompanyName(companyId)
    const html = invoiceCreatedEmail({
      invoiceNumber: invoice.invoice_number,
      customerName,
      total: invoice.total,
      currency: invoice.currency,
      dueDate: invoice.due_date,
      companyName,
      dashboardUrl: DASHBOARD_URL,
    })
    await sendEmail({ to: `${customerName}`, subject: `Invoice ${invoice.invoice_number} Created`, html })
  } catch {
    // fire-and-forget
  }
}

export async function hookAfterPaymentReceived(
  companyId: string,
  payment: { amount: number; currency: string },
  invoiceNumber: string,
  customerName: string,
) {
  try {
    const companyName = await getCompanyName(companyId)
    const html = paymentReceivedEmail({
      invoiceNumber,
      customerName,
      amount: payment.amount,
      currency: payment.currency,
      companyName,
      dashboardUrl: DASHBOARD_URL,
    })
    await sendEmail({ to: `${customerName}`, subject: `Payment Received for ${invoiceNumber}`, html })
  } catch {
    // fire-and-forget
  }
}

export async function hookAfterWorkLogApproved(
  companyId: string,
  workLog: { log_date: string; hours: number; employee_id: string },
  employeeName: string,
  projectName: string,
) {
  try {
    // Look up employee email via company_members → profiles
    const supabase = await createClient()
    const { data: member } = await supabase
      .from('company_members')
      .select('profiles!inner(email)')
      .eq('company_id', companyId)
      .eq('profile_id', workLog.employee_id)
      .single()

    const email = (member?.profiles as { email?: string })?.email
    if (!email) return

    const companyName = await getCompanyName(companyId)
    const html = workLogApprovedEmail({
      employeeName,
      date: workLog.log_date,
      hours: workLog.hours,
      projectName,
      companyName,
    })
    await sendEmail({ to: email, subject: 'Work Log Approved', html })
  } catch {
    // fire-and-forget
  }
}

export async function hookAfterLeaveRequested(
  companyId: string,
  leaveRequest: {
    type: string
    start_date: string
    end_date: string
    days: number
    reason?: string | null
    employee_id: string
  },
  employeeName: string,
) {
  try {
    // Notify company admins/managers — fetch all admin members
    const supabase = await createClient()
    const { data: admins } = await supabase
      .from('company_members')
      .select('profiles!inner(email, full_name)')
      .eq('company_id', companyId)
      .eq('role', 'admin')

    const emails = (admins ?? [])
      .map((a) => (a.profiles as { email?: string })?.email)
      .filter(Boolean) as string[]

    if (emails.length === 0) return

    const companyName = await getCompanyName(companyId)
    const html = leaveRequestEmail({
      employeeName,
      type: leaveRequest.type,
      startDate: leaveRequest.start_date,
      endDate: leaveRequest.end_date,
      days: leaveRequest.days,
      reason: leaveRequest.reason ?? 'No reason provided',
      companyName,
      dashboardUrl: DASHBOARD_URL,
    })
    await sendEmail({ to: emails, subject: `Leave Request from ${employeeName}`, html })
  } catch {
    // fire-and-forget
  }
}

export async function hookAfterTaskAssigned(
  companyId: string,
  task: { id: string; title: string; due_date?: string | null },
  assignerName: string,
  assigneeEmail: string,
  projectName: string,
) {
  try {
    const companyName = await getCompanyName(companyId)
    const html = taskAssignedEmail({
      taskTitle: task.title,
      assignerName,
      projectName,
      dueDate: task.due_date ?? null,
      companyName,
      dashboardUrl: DASHBOARD_URL,
    })
    await sendEmail({ to: assigneeEmail, subject: `Task Assigned: ${task.title}`, html })
  } catch {
    // fire-and-forget
  }
}
