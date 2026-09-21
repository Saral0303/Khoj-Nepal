# Khoj Nepal Backend (Dynamic)

Spring Boot app that serves the **Khoj Nepal** frontend from Thymeleaf templates and stores data in **TiDB (MySQL)**.

## Structure (same as SpringWebVirinchi)

```
src/main/java/io/virinchi/khojnepal/
  Controller/          → PageController + SeedDataController
  Model/               → JPA entities
  Repository/          → Spring Data JPA
  RestAPIController/   → /api JSON endpoints

src/main/resources/
  templates/           → all HTML pages (community + admin/)
  static/css|js|assets → frontend assets
  application.properties
```

## Run

1. Open `khoj-nepal-backend` in IntelliJ
2. Run `KhojNepalApplication`
3. Open **http://localhost:9090/welcome**

Default admin (auto-seeded on first start):
- `admin@khojnepal.com` / `Admin@123`

## Database

Uses the same TiDB Cloud MySQL endpoint as your study project (`test` database). Tables are created automatically (`ddl-auto=update`).

## What is dynamic now

| Feature | API |
|---------|-----|
| Signup / login / logout | `/api/auth/*` |
| Posts feed + create/edit/delete | `/api/posts` |
| Claims + KYC | `/api/claims` |
| Tips / reports | `/api/posts/{id}/tips`, `/api/reports` |
| Notifications / activity | `/api/notifications`, `/api/activity` |
| Admin approve/reject/recover | `/api/admin/*` |

Theme and language still use browser `localStorage` (client preference only).
