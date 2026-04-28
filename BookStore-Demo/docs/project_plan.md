# 📋 Project Plan: Clean Bookstore Demo & OmniSeed Integration
**Version:** 1.0.0
**Execution Mode:** AI Agent Task Checklist
**Goal:** Deliver a fully functional, containerized .NET 8 / React application with the OmniSeed Python CLI integration.

## ✅ Phase 1: Workspace Initialization & OmniSeed Preparation
**Objective:** Set up the isolated monorepo structure and ensure the Python CLI is ready to communicate with the upcoming database.

- [x] Create root directory → Mevcut `Seed Generator Project/` yapısı kullanıldı.
- [x] Create sub-directory `OmniSeed` → Mevcut `Seed-Cli/` kullanıldı.
- [x] Initialize Python environment → Mevcut `pyproject.toml` ile yönetiliyor.
- [x] Create `omniseed.py` with basic CLI argument parsing (`generate`, `reset`) → Mevcut CLI yapısı.
- [x] Create `.demo_cache` folder inside `OmniSeed` → `Seed-Cli/.demo_cache/` mevcut.
- [x] Create sub-directory `Bookstore_Demo` → Mevcut `BookStore-Demo/` kullanıldı.

## ✅ Phase 2: .NET 8 Backend Setup (Clean Architecture)
**Objective:** Build the robust backend API with Entity Framework Core and PostgreSQL.

- [x] Initialize .NET 8 Solution inside `BookStore-Demo/Backend` (`Bookstore.slnx`).
- [x] Create Class Libraries: `Domain`, `Application`, `Infrastructure`.
- [x] Create Web API Project: `API`.
- [x] Set up Project References (API → App & Infra; Infra → App & Domain; App → Domain).
- [x] **Domain:** Create Entities (`User`, `Category`, `Book`, `Basket`, `BasketItem`, `Sale`, `SaleItem`).
- [x] **Domain:** FK relations defined per `spec.md` — `SellerId` on Book & SaleItem with `OnDelete(Restrict)`.
- [x] **Infrastructure:** `AppDbContext` + 7 Fluent API configurations + PostgreSQL connection.
- [x] **Infrastructure:** EF Core Code-First Migration (`InitialCreate`) oluşturuldu.
- [x] **Application:** DTOs (`BookDto`, `CreateBookDto`, `CheckoutRequestDto`, `SaleChartDataDto`) + Repository & Service interfaces.
- [x] **API:** `BooksController` (`GET`, `POST`, `DELETE`).
- [x] **API:** `BasketController` (`POST /checkout` → Sale + SaleItem + stok düşürme).
- [x] **API:** `BasketController` (Persistent Basket: AddItem, RemoveItem, GetActiveBasket, ClearBasket).
- [x] **API:** `CategoriesController` (GET, POST, PUT, DELETE with `[Authorize(Roles="Seller,Admin")]`).
- [x] **API:** `BooksController` (Added `GET /id`, `PUT /id` and Pagination for `GET` method).
- [x] **API:** `SalesController` (`GET /chart-data` → tarihe göre gruplama).
- [x] **API/Security:** Implement ASP.NET Core Identity & JWT Authentication (Customer, Seller, Admin roles).

## ✅ Phase 3: The OmniSeed Trigger Integration
**Objective:** Connect the .NET Backend to the Python CLI tool securely.

- [x] **Infrastructure:** Create `OmniSeedTriggerService` implementing `IOmniSeedService`.
- [x] Configure the service to execute a shell command/process pointing to the Python script: `python ../OmniSeed/omniseed.py reset`.
- [x] Handle process exit codes (0 = Success, Error otherwise).
- [x] **API:** Create `AdminController` with `POST /api/admin/reset` endpoint calling the trigger service.
- [x] **API:** Remove `HasData` and default EF Core seeding to prevent Data inconsistency on OmniSeed Truncate.

## ✅ Phase 4: React Frontend Setup (Vite)
**Objective:** Build a fast, lightweight SPA to consume the API and demonstrate the system state.

- [x] Initialize React + Vite project in `Bookstore_Demo/Frontend`.
- [x] Install dependencies: `tailwindcss`, `axios`, `recharts` (for seller graphs), `react-router-dom`.
- [x] Configure TailwindCSS.
- [x] **UI Component:** Create `BookCard` and `CatalogView` (Storefront).
- [x] **UI Component:** Create `SellerDashboard` with a line chart fetching data from `/api/sales/chart-data`.
- [x] **UI Component:** Create `CartModal` with a "Checkout" button.
- [x] **UI Component (CRITICAL):** Create the fixed Floating Action Button (FAB) "Reset Demo State" in the bottom right corner.
- [x] Wire the FAB to call `POST /api/admin/reset` and trigger `window.location.reload()` on success.

## ✅ Phase 5: Containerization & Orchestration (Docker)
**Objective:** Make the entire system plug-and-play without local dependencies.

- [x] Create `Dockerfile` for the .NET 8 Web API.
- [x] Create `Dockerfile` for the React Frontend.
- [x] Create `docker-compose.yml` in the `Bookstore_Demo` root.
- [x] **Compose Config:** Add `db` service (PostgreSQL image).
- [x] **Compose Config:** Add `backend` service. Map volumes to ensure the backend container can reach the `OmniSeed` Python script and `.demo_cache` folder.
- [x] **Compose Config:** Add `frontend` service on port 3000.
- [x] Test system orchestration: `docker-compose up -d --build`.

## 📌 Phase 6: End-to-End Testing & Handoff
**Objective:** Ensure the demo flows flawlessly for the presentation.

- [ ] **Test 1 (Data Gen):** Run `omniseed.py generate` manually to let AI create the initial `golden_state.sql` file based on the EF Core schema.
- [ ] **Test 2 (UI Rendering):** Verify the React app displays the AI-generated Turkish books and realistic prices.
- [ ] **Test 3 (Data Corruption):** From the UI, buy books (reduce stock), and add a junk book ("asdfasdf", $99999).
- [ ] **Test 4 (The Magic Reset):** Click the "Reset Demo State" FAB. Verify the backend successfully triggers the Python script, truncates the DB, and restores the exact Golden State.
- [ ] Finalize `README.md` with startup instructions for the professor.
- [ ] Zip the `Yazilim_Muhendisligi_Odev` folder for submission.