import { env, isEmailNotificationsEnabled } from "@/lib/env";

export type WorkflowNotificationEvent = "Submitted" | "Approved" | "Rejected" | "Active" | "Archived";

export type WorkflowNotificationPayload = {
  event: WorkflowNotificationEvent;
  entityType: "SOP";
  entityId: number;
  title: string;
  remarks?: string;
};

export type WorkflowNotificationResult =
  | { status: "disabled" }
  | { status: "deferred"; reason: string };

export async function sendWorkflowNotification(
  payload: WorkflowNotificationPayload,
): Promise<WorkflowNotificationResult> {
  if (!isEmailNotificationsEnabled()) {
    return { status: "disabled" };
  }

  if (!env.OUTLOOK_SENDER_EMAIL) {
    return { status: "deferred", reason: "Outlook sender email is not configured." };
  }

  return {
    status: "deferred",
    reason: `Workflow email for ${payload.entityType} ${payload.entityId} is queued conceptually, but Outlook delivery is waiting for Microsoft credentials and Graph integration.`,
  };
}