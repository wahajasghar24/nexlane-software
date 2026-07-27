import { eventBus } from './event-bus'
import { activityHandler } from './handlers/activity-handler'
import { notificationHandler } from './handlers/notification-handler'
import { webhookHandler } from './handlers/webhook-handler'
import { EventTypes } from './types'

export function registerEventHandlers() {
  const allEvents = Object.values(EventTypes)

  for (const eventType of allEvents) {
    eventBus.on(eventType, activityHandler)
  }

  const notificationEvents = [
    EventTypes.TASK_ASSIGNED,
    EventTypes.TASK_STATUS_CHANGED,
    EventTypes.TASK_COMPLETED,
    EventTypes.TASK_BLOCKED,
    EventTypes.WORK_LOG_SUBMITTED,
    EventTypes.WORK_LOG_APPROVED,
    EventTypes.WORK_LOG_REJECTED,
    EventTypes.COMMENT_CREATED,
    EventTypes.LEAD_ASSIGNED,
    EventTypes.INVOICE_CREATED,
    EventTypes.INVOICE_PAID,
    EventTypes.LEAD_CONVERTED,
    EventTypes.DEAL_WON,
    EventTypes.DEAL_LOST,
    EventTypes.LEAD_NOTE_ADDED,
  ]

  for (const eventType of notificationEvents) {
    eventBus.on(eventType, notificationHandler)
  }

  const webhookEvents = [
    EventTypes.EMPLOYEE_CREATED,
    EventTypes.PROJECT_CREATED,
    EventTypes.TASK_CREATED,
    EventTypes.TASK_COMPLETED,
    EventTypes.TASK_STATUS_CHANGED,
    EventTypes.WORK_LOG_SUBMITTED,
    EventTypes.LEAD_CREATED,
    EventTypes.LEAD_CONVERTED,
    EventTypes.CUSTOMER_CREATED,
    EventTypes.INVOICE_CREATED,
    EventTypes.INVOICE_PAID,
    EventTypes.PAYMENT_RECEIVED,
    EventTypes.DEAL_CREATED,
    EventTypes.DEAL_WON,
    EventTypes.DEAL_LOST,
    EventTypes.LEAD_ASSIGNED,
    EventTypes.LEAD_STATUS_CHANGED,
    EventTypes.CRM_COMPANY_CREATED,
    EventTypes.CONTACT_CREATED,
    EventTypes.ACTIVITY_CREATED,
  ]

  for (const eventType of webhookEvents) {
    eventBus.on(eventType, webhookHandler)
  }
}
