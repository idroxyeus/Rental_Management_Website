# 🏢 Rental Management System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)

A comprehensive and professional Rental Management System designed to streamline operations for landlords and provide a seamless experience for tenants. This dynamic web application offers role-based access, automated payment tracking, property management, and a robust complaint resolution system.

## ✨ Features

### For Landlords
* **Dashboard Overview**: Get high-level analytics, including monthly income, profit & loss, and remaining dues per tenant.
* **Property Management**: Perform robust CRUD operations. Easily add, edit, or remove properties. Monitor vacant vs. occupied units.
* **Tenant & Lease Management**: Keep track of tenant details, active leases, and update family members directly from the property details view.
* **Automated Billing**: Automatically generate pending monthly payments for active leases.

### For Tenants
* **Personalized Dashboard**: View currently leased properties and explore vacant properties available for rent.
* **Payments & History**: Track rent payments and view payment history.
* **Maintenance & Complaints**: Submit maintenance requests or complaints specifically linked to occupied properties and track their resolution status.

### System-Wide
* **Role-Based Access Control**: Secure login ensuring that admins, landlords, and tenants only access pertinent information.
* **Modern UI/UX**: Premium, responsive "glassmorphism" design with micro-animations and loading states for a flawless user experience.

## 🛠️ Tech Stack

* **Frontend**: React.js, Tailwind CSS (or Vanilla CSS with modern aesthetics), Vite
* **Backend**: Node.js, Express.js
* **Database**: SQL (MySQL/PostgreSQL)
* **Authentication**: JSON Web Tokens (JWT)

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
* [Node.js](https://nodejs.org/)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
* SQL Database Server (e.g., MySQL)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/rental-management-system.git
   cd rental-management-system
   ```

2. **Database Setup:**
   * Create a database in your SQL server.
   * Run the schema file located in `database/schema.sql` to generate the necessary tables.

3. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create a .env file and add your database credentials and JWT secret
   npm run dev
   ```

4. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## 🌐 Hosting & Deployment

* **Frontend**: Recommended to deploy on [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).
* **Backend**: Can be hosted on platforms like [Render](https://render.com/), [Railway](https://railway.app/), or [Heroku](https://www.heroku.com/).
* **Database**: Use managed database services like [PlanetScale](https://planetscale.com/), [Aiven](https://aiven.io/), or [Supabase](https://supabase.com/).

## 💡 Customization & Contribution

Feel free to fork this project, submit pull requests, or send suggestions to improve the system.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
