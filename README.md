# Biometric Secure Voting System

### Modern Identity Verification • Passwordless Authentication • Atomic Voting Logic

## Project Overview

This project is a secure, digital voting platform designed to eliminate electoral fraud through **Biometric Identity Binding**. By leveraging the **WebAuthn API**, students can register their hardware-backed biometrics (Fingerprint/FaceID) to their Matric Number, enabling a seamless, passwordless voting experience that is resistant to phishing and credential stuffing.

### Key Features

* **Passwordless Biometric Login:** Implementation of FIDO2/WebAuthn for secure, hardware-level authentication.
* **Atomic Voting Transactions:** Guaranteed data integrity using Prisma Transactions—preventing "ghost votes" or lost ballots.
* **One-Man-One-Vote Enforcement:** Strict relational constraints ensuring unique `VoterRecords` per election.
* **Anonymous Ballot System:** Complete decoupling of the voter's identity from the cast ballot to ensure privacy.
* **Role-Based Access Control (RBAC):** Distinct flows for Voters and Administrators (Election creation, Candidate management).
* **Automated API Documentation:** Full Swagger/OpenAPI integration for easy testing and integration.

---

## System Architecture

The system follows a decoupled architecture focused on security and scalability:

### The Authentication Flow

1. **Identity Proofing:** User logs in with a PIN to verify initial identity.
2. **Attestation:** User registers their device's public key via a biometric challenge.
3. **Assertion:** For all future logins, the user signs a server challenge using their device's secure enclave (Private Key).

---

## Tech Stack

* **Framework:** NestJS (TypeScript)
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Security:** `@simplewebauthn`, Passport.js, JWT, bcrypt
* **Documentation:** Swagger UI

---

##  Getting Started

### Prerequisites

* Node.js (v18+)
* PostgreSQL Instance

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/biometric-voting.git
cd biometric-voting

```


2. **Install dependencies**
```bash
npm install

```


3. **Environment Setup**
Create a `.env` file in the root:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/voting_db"
JWT_SECRET="your_ultra_secret_key"
RP_ID="localhost"
RP_NAME="Biometric Voting System"

```


4. **Database Migration**
```bash
npx prisma migrate dev --name init

```


5. **Start the Application**
```bash
npm run start:dev

```



---

## API Documentation

Once the server is running, access the interactive Swagger documentation at:
`http://localhost:3000/api`

---

##  Security Considerations

* **No Cleartext Passwords:** All PINs are hashed using `bcrypt` with a salt factor of 12.
* **FIDO2 Compliance:** Private keys never leave the user's hardware device.
* **Input Validation:** Strict DTO validation using `class-validator` to prevent SQL injection and mass-assignment attacks.
* **Atomic State:** All voting actions are wrapped in database-level transactions to ensure consistency.

---

### Contact & Support

Developed as a Final Year Project exploring **Advanced Cryptographic Identity in Public Systems**.
