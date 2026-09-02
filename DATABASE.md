# Database / System Documentation

## Entity relationship overview

**Admin**
- id
- name
- email
- passwordHash
- createdAt

**Client**
- id
- name
- email
- phone
- whatsapp
- createdAt
- updatedAt
- one Client → many Bookings

**Booking**
- reference
- clientId
- serviceId
- packageId
- eventType
- eventName
- eventDate
- guests
- venue
- address
- city
- area
- locationDetails
- decoration
- catering
- photography
- stage
- lighting
- specialInstructions
- status
- timestamps

**Service**
- name, slug, description, features, price, image, active

**Package**
- name, slug, description, included, price, image, active

**Event**
- name, type, date, location, description, images, services, completed

**GalleryItem**
- title, category, image, description, visible

**Inquiry**
- name, email, phone, subject, message, status

## Booking status lifecycle

Pending → Under Review → Confirmed → In Progress → Completed

A booking can also be Cancelled.

## API routes

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET/POST /api/bookings`
- `PATCH /api/bookings/:id/status`
- `DELETE /api/bookings/:id`
- `POST /api/contact`
- `GET/POST /api/services`
- `GET/POST /api/packages`
- `GET/POST /api/events`
- `GET/POST /api/gallery`
- `GET/POST /api/clients`
- `GET/POST /api/inquiries`
- `PATCH/DELETE /api/content/:type`

Admin mutation routes require the signed admin session cookie.

## Security

- Admin password stored as a bcrypt hash.
- Admin session stored as an HTTP-only cookie.
- Admin APIs verify the session before mutations.
- Production deployment must use a strong `AUTH_SECRET`.
- Never commit `.env` or production credentials.
