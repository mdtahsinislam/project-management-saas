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

