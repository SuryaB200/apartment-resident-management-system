# Apartment & Resident Management System
## Entity-Relationship (ER) Diagram & Relational Mappings

**Institution:** SRM Institute of Science and Technology, Tiruchirappalli  
**Degree / Department:** B.Tech — Artificial Intelligence (2024–2028)  
**DBMS Capstone Project Guide:** Dr. S. P. Ramya  

---

## 1. High-Level Mermaid ER Diagram

```mermaid
erDiagram
    BUILDINGS ||--o{ FLATS : "contains (1:M)"
    FLATS ||--o{ OCCUPANCY_HISTORY : "tracks tenancies (1:M)"
    RESIDENTS ||--o{ OCCUPANCY_HISTORY : "holds tenure (1:M)"
    USERS ||--o| RESIDENTS : "authenticates (1:1)"
    USERS ||--o| STAFF_PROFILES : "associates (1:1)"
    
    FLATS ||--o{ MAINTENANCE_INVOICES : "billed to (1:M)"
    MAINTENANCE_INVOICES ||--o{ PAYMENTS : "settled by (1:M)"
    
    FLATS ||--o{ SERVICE_TICKETS : "originates from (1:M)"
    RESIDENTS ||--o{ SERVICE_TICKETS : "raises (1:M)"
    STAFF_PROFILES ||--o{ SERVICE_TICKETS : "assigned to (1:M)"
    
    FLATS ||--o{ VISITOR_LOGS : "visited (1:M)"
    USERS ||--o{ VISITOR_LOGS : "authorized by guard (1:M)"
    
    AMENITIES ||--o{ AMENITY_BOOKINGS : "reserved under (1:M)"
    RESIDENTS ||--o{ AMENITY_BOOKINGS : "booked by (1:M)"
    FLATS ||--o{ AMENITY_BOOKINGS : "billed/attributed (1:M)"
    
    PARKING_SLOTS ||--o{ PARKING_ALLOCATIONS : "demarcates (1:M)"
    FLATS ||--o{ PARKING_ALLOCATIONS : "allocated quota (1:M)"
    RESIDENTS ||--o{ PARKING_ALLOCATIONS : "registers vehicle (1:M)"
    
    USERS ||--o{ AUDIT_LOGS : "acts upon (1:M)"

    BUILDINGS {
        bigint id PK
        varchar building_code UK
        varchar name
        integer total_floors
    }

    FLATS {
        bigint id PK
        bigint building_id FK
        varchar flat_number
        integer floor_number
        decimal carpet_area_sqft
        varchar flat_type
        varchar occupancy_status
    }

    RESIDENTS {
        bigint id PK
        bigint user_id FK
        bigint flat_id FK
        varchar first_name
        varchar last_name
        varchar resident_type
        varchar contact_number
        varchar email
    }

    OCCUPANCY_HISTORY {
        bigint id PK
        bigint flat_id FK
        bigint resident_id FK
        varchar occupancy_type
        date move_in_date
        date move_out_date
        boolean is_current
    }

    MAINTENANCE_INVOICES {
        bigint id PK
        varchar invoice_number UK
        bigint flat_id FK
        date billing_period_month
        date issue_date
        date due_date
        decimal base_amount
        decimal late_fee
        decimal total_amount
        decimal amount_paid
        decimal outstanding_balance
        varchar status
    }

    PAYMENTS {
        bigint id PK
        varchar receipt_number UK
        bigint invoice_id FK
        decimal amount
        timestamp payment_date
        varchar payment_mode
        varchar transaction_reference UK
    }

    SERVICE_TICKETS {
        bigint id PK
        varchar ticket_number UK
        bigint flat_id FK
        bigint raised_by_id FK
        bigint assigned_to_id FK
        varchar category
        varchar priority
        varchar status
        timestamp sla_deadline
        timestamp resolved_at
    }

    VISITOR_LOGS {
        bigint id PK
        varchar pass_number UK
        varchar visitor_name
        varchar visitor_phone
        bigint flat_id FK
        varchar vehicle_number
        timestamp check_in_time
        timestamp check_out_time
        varchar status
    }

    AMENITIES {
        bigint id PK
        varchar name UK
        varchar code UK
        integer capacity
        decimal hourly_rate
        boolean is_operational
    }

    AMENITY_BOOKINGS {
        bigint id PK
        bigint amenity_id FK
        bigint resident_id FK
        bigint flat_id FK
        timestamp start_time
        timestamp end_time
        varchar booking_status
    }

    PARKING_SLOTS {
        bigint id PK
        varchar slot_number UK
        varchar location_zone
        varchar slot_type
        varchar status
    }

    PARKING_ALLOCATIONS {
        bigint id PK
        bigint slot_id FK
        bigint flat_id FK
        bigint resident_id FK
        varchar vehicle_number
        varchar vehicle_type
        timestamp allocated_at
        timestamp released_at
        boolean is_active
    }

    AUDIT_LOGS {
        bigint id PK
        bigint acting_user_id FK
        varchar action
        varchar entity_type
        varchar record_id
        timestamp timestamp
    }
```

---

## 2. Relational Cardinality & Referential Integrity

| Relationship | Cardinality | Parent Entity | Child Entity | Foreign Key | Cascade Policy |
|---|---|---|---|---|---|
| Block Containment | 1 : N | `Buildings` | `Flats` | `building_id` | `ON DELETE RESTRICT` |
| Tenancy Tracking | 1 : N | `Flats` | `Occupancy_History` | `flat_id` | `ON DELETE RESTRICT` |
| Resident Tenancy | 1 : N | `Residents` | `Occupancy_History` | `resident_id` | `ON DELETE RESTRICT` |
| Periodic Invoicing | 1 : N | `Flats` | `Maintenance_Invoices` | `flat_id` | `ON DELETE RESTRICT` |
| Payment Settlement | 1 : N | `Maintenance_Invoices` | `Payments` | `invoice_id` | `ON DELETE RESTRICT` |
| Maintenance Dispatch| 1 : N | `Flats` | `Service_Tickets` | `flat_id` | `ON DELETE RESTRICT` |
| Staff Assignment | 1 : N | `StaffProfiles` | `Service_Tickets` | `assigned_to_id` | `ON DELETE SET NULL` |
| Gate Access | 1 : N | `Flats` | `Visitor_Logs` | `flat_id` | `ON DELETE RESTRICT` |
| Facility Booking | 1 : N | `Amenities` | `Amenity_Bookings` | `amenity_id` | `ON DELETE RESTRICT` |
| Parking Bay Allocation | 1 : N | `Parking_Slots` | `Parking_Allocations` | `slot_id` | `ON DELETE RESTRICT` |
| Audit Attribution | 1 : N | `Users` | `Audit_Logs` | `acting_user_id` | `ON DELETE SET NULL` |
