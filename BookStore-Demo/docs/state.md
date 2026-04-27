# 🧠 AI Context & System State (state.md)

## 📌 Active Development Context
**Project:** Clean Bookstore Demo (Demo Environment) & OmniSeed (AI State Manager)
**Current Phase:** Phase 3 ✅ Tamamlandı → Phase 4 sırada
**Last Modification:** 2026-04-28T01:05:00+03:00

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
| **PostgreSQL DB** | Done | `5432` | Docker Compose üzerinden postgres:15-alpine ayakta. |
| **OmniSeed CLI** | Done | `Terminal` | Phase 3 tamamlandı, `.NET OmniSeedTriggerService` üzerinden entegre edildi. |
| **.NET 8 Backend** | Done | `5000 / 5001` | Category (CRUD), Book (Update, Pagination), Kalıcı Sepet (Basket) altyapısı kuruldu. |
| **React Frontend** | Done | `3000` | Phase 4 tamamlandı. Vite/React entegrasyonu başarılı. Yok. Envanter yönetimi UX iyileştirmeleri ve Kategori CRUD işlemleri tamamlandı. Uygulama E2E testlerine hazır. |

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
1. **Phase 6:** End-to-End Testing & Handoff.