# Project Management SaaS — API Documentation

## Live Base URL


# https://project-management-saas-eta.vercel.app/


## Tech Stack
- Next.js (App Router) + TypeScript
- Prisma + PostgreSQL
- JWT (Access + Refresh Token)
- Zod Validation
- Stripe + bKash Payment
- Role-based Access: `ADMIN` | `OWNER` | `MEMBER`

---

## Demo Credentials

| Role   | Email              | Password    |
|--------|--------------------|-------------|
| ADMIN  | admin@demo.com     | Admin@123   |
| OWNER  | owner@demo.com     | Owner@123   |
| MEMBER | member@demo.com    | Member@123  |

---

## Standard Response Format

```
1. Auth APIs
1.1 Register

Method: POST
URL: /api/v1/auth/register
Auth: None
Body

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "role": "MEMBER"
}

Roles allowed in body: ADMIN | OWNER | MEMBER
```


```
1.2 Login

Method: POST
URL: /api/v1/auth/login
Auth: None
Body:

JSON

{
  "email": "admin@demo.com",
  "password": "Admin@123"
}

Response includes: user, accessToken, refreshToken

```

```
1.3 Get Current User (Me)

Method: GET
URL: /api/v1/auth/me
Auth: Bearer Token (Required)
```

```
1.4 Refresh Token

Method: POST
URL: /api/v1/auth/refresh
Auth: None
Body:

JSON

{
  "refreshToken": "your_refresh_token"
}
```

```
1.5 Logout

Method: POST
URL: /api/v1/auth/logout
Auth: Bearer Token (Required)
Body: none
```

```
2. Organization APIs
2.1 Create Organization

Method: POST
URL: /api/v1/organizations
Auth: Bearer (ADMIN or OWNER)
Body:

{
  "name": "Tech Solutions Ltd",
  "slug": "tech-solutions",
  "description": "Software company"
}
```

```
2.2 List Organizations

Method: GET
URL: /api/v1/organizations?page=1&limit=10&search=tech
Auth: Bearer (Required)
Query: page, limit, search
```

```
2.3 Get Single Organization

Method: GET
URL: /api/v1/organizations/{id}
Auth: Bearer (Required)
```

```
2.4 Update Organization

Method: PATCH
URL: /api/v1/organizations/{id}
Auth: Bearer (ADMIN or own OWNER)
Body:

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

```
2.5 Soft Delete Organization

Method: DELETE
URL: /api/v1/organizations/{id}
Auth: Bearer (ADMIN or own OWNER)
```

```
3. Project APIs
3.1 Create Project

Method: POST
URL: /api/v1/projects
Auth: Bearer (ADMIN or OWNER)
Body:

{
  "name": "Website Redesign",
  "organizationId": "org_cuid_here",
  "description": "Client website redesign",
  "teamId": "optional_team_id",
  "startDate": "2026-10-01T00:00:00.000Z",
  "endDate": "2026-11-01T00:00:00.000Z"
}
```

```
3.2 List Projects

Method: GET
URL: /api/v1/projects?page=1&limit=10&status=ACTIVE&search=website&organizationId=xxx
Auth: Bearer (Required)
Query: page, limit, status, search, organizationId
Features: Pagination, Filter, Search, Redis Cache

```

```
3.3 Get Single Project

Method: GET
URL: /api/v1/projects/{id}
Auth: Bearer (Required)

3.4 Update Project

Method: PATCH
URL: /api/v1/projects/{id}
Auth: Bearer (ADMIN or OWNER)
Body:

{
  "name": "Updated Project",
  "status": "COMPLETED"
}
```

```
3.5 Soft Delete Project

Method: DELETE
URL: /api/v1/projects/{id}
Auth: Bearer (ADMIN or OWNER)


4. Task APIs
4.1 Create Task

Method: POST
URL: /api/v1/tasks
Auth: Bearer (Required)
Body:

{
  "title": "Design Homepage",
  "projectId": "project_cuid_here",
  "priority": "HIGH",
  "description": "Create modern homepage UI",
  "assigneeId": "optional_user_id",
  "dueDate": "2026-10-15T00:00:00.000Z"
}

Priority: LOW | MEDIUM | HIGH | URGENT

```

```
4.2 List Tasks

Method: GET
URL: /api/v1/tasks?page=1&limit=10&status=TODO&priority=HIGH&projectId=xxx&search=design
Auth: Bearer (Required)
Query: page, limit, status, priority, projectId, search

4.3 Get Single Task

Method: GET
URL: /api/v1/tasks/{id}
Auth: Bearer (Required)
Includes: creator, assignee, project, comments, subTasks, activityLogs

4.4 Update Task
Method: PATCH
URL: /api/v1/tasks/{id}
Auth: Bearer (Required)
Body:

{
  "title": "Updated Homepage Design",
  "priority": "URGENT",
  "description": "Updated description"
}
```

```
4.5 Update Task Status

Method: PATCH
URL: /api/v1/tasks/{id}/status
Auth: Bearer (Required)
Body:

JSON

{
  "status": "IN_PROGRESS"
}


Status: TODO | IN_PROGRESS | IN_REVIEW | DONE | CANCELLED
Side effect: Activity Log created

4.6 Assign Task

Method: PATCH
URL: /api/v1/tasks/{id}/assign
Auth: Bearer (Required)
Body:

{
  "assigneeId": "user_cuid_here"
}

assigneeId can be null to unassign


4.7 Soft Delete Task

Method: DELETE
URL: /api/v1/tasks/{id}
Auth: Bearer (ADMIN or OWNER)


5. Comment APIs
5.1 Add Comment

Method: POST
URL: /api/v1/tasks/{id}/comments
Auth: Bearer (Required)
Body:

{
  "content": "This looks good, please proceed."
}
```

```
5.2 List Comments

Method: GET
URL: /api/v1/tasks/{id}/comments
Auth: Bearer (Required)


6. Payment APIs (Stripe + bKash)
6.1 Initiate Payment

Method: POST
URL: /api/v1/payments/initiate
Auth: Bearer (Required)
Body (Stripe):

{
  "amount": 50,
  "method": "STRIPE",
  "description": "Pro Plan Subscription"
}

{
  "amount": 50,
  "method": "STRIPE",
  "description": "Pro Plan Subscription"
}

Body (bKash):

{
  "amount": 100,
  "method": "BKASH",
  "description": "Monthly Plan"
}

Response (Stripe): checkoutUrl, sessionId, paymentId
Response (bKash): bkashURL, paymentID, paymentId

```

```
6.2 Get Payment by ID

Method: GET
URL: /api/v1/payments/{id}
Auth: Bearer (Required — own payment or ADMIN)

6.3 List Payments

Method: GET
URL: /api/v1/payments?page=1&limit=10&status=SUCCESS
Auth: Bearer (Required)
Query: page, limit, status

6.4 Stripe Webhook

Method: POST
URL: /api/v1/payments/stripe/webhook
Auth: Stripe Signature Header
Events handled: checkout.session.completed, checkout.session.expired

6.5 bKash Callback

Method: GET
URL: /api/v1/payments/bkash/callback?paymentID=xxx&status=success
Auth: None (Gateway callback)

6.6 Confirm Subscription (Transaction Example)

Method: POST
URL: /api/v1/payments/confirm-subscription
Auth: Bearer (Required)
Body:

{
  "paymentId": "payment_cuid",
  "organizationId": "org_cuid"
}

Stripe Test Card: 4242 4242 4242 4242 | Any future expiry | Any CVC

```

```
7. Admin APIs (ADMIN only)
7.1 Dashboard

Method: GET
URL: /api/v1/admin/dashboard
Auth: Bearer (ADMIN only)
Returns: totalUsers, totalOrganizations, totalProjects, totalTasks, tasksByStatus, recentActivities

7.2 List Users

Method: GET
URL: /api/v1/admin/users?page=1&limit=10&role=MEMBER&search=john
Auth: Bearer (ADMIN only)
Query: page, limit, role, search


7.3 Audit Logs

Method: GET
URL: /api/v1/admin/audit-logs?page=1&limit=20&action=TASK_CREATED
Auth: Bearer (ADMIN only)
Query: page, limit, action

```

# Role Permission Matrix
```
Action,ADMIN,OWNER,MEMBER
Register / Login,✅,✅,✅
Create Organization,✅,✅,❌
Manage own Organization,✅,✅,❌
Create Project,✅,✅,❌
Create / Update Task,✅,✅,✅
Assign Task,✅,✅,✅
Soft Delete Task/Project,✅,✅,❌
Payment Initiate,✅,✅,✅
Admin Dashboard / Users,✅,❌,❌
Audit Logs,✅,❌,❌

```

# Extra Mandatory Features Implemented

```
Feature,Status
Soft Delete (deletedAt),✅
Audit / Activity Logs,✅
Database Transaction,✅
Pagination + Filter + Search,✅
Consistent JSON Response,✅
Zod Input Validation,✅
JWT Access + Refresh Token,✅
Role-based Authorization,✅
Stripe Payment,✅
bKash Payment,✅
Redis Caching (Projects),✅
Rate Limiting (Login),✅
Google OAuth,✅
Seed Data + Demo Admin,✅
Live Deployment (Vercel),✅

```
# Postman Testing Quick Start (Live)

```
Login

POST https://project-management-saas-eta.vercel.app/api/v1/auth/login

Copy accessToken
For every protected request:
Authorization → Type: Bearer Token
Token: paste accessToken

Body always: raw → JSON (not Text)

Important Notes

Access Token validity: 15 minutes
Refresh Token validity: 7 days
Soft deleted records are excluded from list APIs
OWNER can only manage their own organizations/projects
ADMIN has full access
All write operations that change tasks create Activity Logs

```


# Live Links

```
Item,URL
Production API,https://project-management-saas-eta.vercel.app
Login Endpoint,https://project-management-saas-eta.vercel.app/api/v1/auth/login
Admin Dashboard,https://project-management-saas-eta.vercel.app/api/v1/admin/dashboard

```
