# 🧠 AI Context & System State (state.md)

## 📌 Active Development Context
**Project:** Clean Bookstore Demo (Demo Environment) & OmniSeed (AI State Manager)
**Current Phase:** Phase 5 ✅ Tamamlandı → Phase 6 (E2E Testing & Handoff)
**Last Modification:** 2026-04-28T21:26:00+03:00

---

## 🏗️ Architectural Directives (CRITICAL FOR AI)
1. **Clean Architecture Strictness:** The Domain layer (`Bookstore.Domain`) must have ZERO external dependencies. Do not inject EF Core, third-party libraries, or infrastructure concerns into Domain entities.
2. **CQRS Enforcement:** Strictly separate read operations (Queries) from write operations (Commands) in the Application layer. Never use a Command handler to return complex view data.
3. **High-Performance Mindset:** When writing backend logic, especially for database seeding or analytics queries, utilize parallel processing optimizations (`Task.WhenAll`, asynchronous streams) where applicable. Avoid blocking synchronous I/O operations.
4. **OmniSeed Isolation:** OmniSeed is an independent CLI tool. The .NET API must only trigger it via an isolated external process call (`System.Diagnostics.Process`). Do not attempt to integrate Python scripts directly into the C# application memory space.

---

## 🗂️ Component Tracking Matrix
*[AI: Update the status and blockers in real-time as you develop the system]*

| Component | Status (Pending/WIP/Done) | Port / Interface | Active Blocker / Notes |
| :--- | :--- | :--- | :--- |
| **PostgreSQL DB** | Done | `5432` | Docker Compose üzerinden postgres:15-alpine ayakta. Golden State verisi OmniSeed ile yüklendi. |
| **OmniSeed CLI** | Done | `Terminal / API` | Docker container içinden çalışıyor. `POST /api/admin/reset` ile tetiklenebilir. `pydantic-settings` + `rich` eklendi. |
| **.NET 8 Backend** | Done | `5000` | Admin CRUD (Users), Pagination, OmniSeed Trigger tam çalışır. Auth bypass aktif. |
| **React Frontend** | Done | `3000` | Pagination eklendi (8/sayfa). Admin panelinde sekmeli yapı: Kategoriler + Kullanıcı Yönetimi (CRUD + Rol atama). Golden Button çalışıyor. |

---

## 🧩 Database Schema Readiness (Entity Tracking)
*[AI: Mark with 'x' only when the Entity, its EF Core configuration, and migration are successfully verified]*
- [x] User (Role management: Admin, Seller, Customer)
- [x] Category
- [x] Book (Must include `SellerId` Foreign Key constraint)
- [x] Basket & BasketItem
- [x] Sale & SaleItem (Crucial for Seller Analytics)

---

## 🚀 Immediate Execution Queue
*[AI: Pop the top item from this queue, execute it, and update the file. Never execute multiple complex steps simultaneously.]*
1. **README.md:** ✅ Proje kök dizinine profesyonel README oluşturuldu.
2. **Phase 6:** End-to-End Testing & Handoff.