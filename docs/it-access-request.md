# IT Access Request

## What we need from IT
This project uses Snowflake for application data and Microsoft Entra ID + SharePoint + Microsoft Graph for authentication, secure file access, and email.

## Required from IT
### 1. Microsoft Entra ID app registration
Please create one app registration for the Swish Compliance web application.

Needed outputs:
- Tenant ID
- Client ID
- Client Secret or certificate-based secret
- Approved redirect URI for local development
- Approved redirect URI for production later

Recommended development redirect URI:
- `http://localhost:3001/api/auth/callback/azure-ad`

### 2. Microsoft Graph permissions
Please grant or approve the permissions needed for:
- user sign-in
- SharePoint file access
- Outlook email sending

Recommended minimum set:
- `openid`
- `profile`
- `email`
- `offline_access`
- `User.Read`
- `Mail.Send`
- `Sites.Selected`
- `Files.ReadWrite.All` only if `Sites.Selected` is not sufficient for the target design

Preferred approach:
- use `Sites.Selected` and grant the app access only to the specific SharePoint site used by this project

### 3. SharePoint site access
Please provide:
- SharePoint Site URL
- SharePoint Site ID
- target document library name
- application access to that site/library for upload, read, and update operations

### 4. Outlook sender setup
Please confirm the mailbox or sender identity the app should use for notifications.

Needed outputs:
- sender email address
- confirmation that the app can send mail using Microsoft Graph

Current sender to configure:
- `automation@swishhh.net`

## Notes
- `NEXTAUTH_URL` is set by the application team, not by IT.
- `NEXT_PUBLIC_AZURE_REDIRECT_URI` is also set by the application team, but IT must register the same redirect URI in Entra ID.

## Short email body
Subject: Access Request for Swish Compliance Web Application

Hi IT Team,

We are building an internal web application called Swish Compliance to manage SOPs, approvals, implementation tracking, audits, corrective actions, evidence, and KPI monitoring.

The application uses Snowflake for data storage and Microsoft services for authentication, secure SharePoint document access, and Outlook-based notifications.

Please support us with the following for the application:
- Microsoft Entra ID app registration
- Tenant ID, Client ID, and Client Secret
- redirect URI registration for local development: `http://localhost:3001/api/auth/callback/azure-ad`
- Microsoft Graph permissions for sign-in, SharePoint access, and email sending
- access to the target SharePoint site/document library
- Outlook sender identity for application notifications

Please use least-privilege access where possible. Preferred SharePoint access is through `Sites.Selected` scoped only to the required site.

Thanks,
Fadi
Business Excellence
