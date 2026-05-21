# 🛒 Bolt — Full-Stack E-Commerce Application

A modern, full-stack web store built with **Vue 3** and **Node.js/Express**, featuring a complete shopping experience with user authentication, product management, order handling, and more.

> 🔗 **Live Demo:** [bolt-ajax.netlify.app](https://zesty-jalebi-37f6d3.netlify.app)

-----

## 📸 Screenshots

> *Screenshots coming 

-----

## ✨ Features

- **Authentication** — Register/login with JWT, Google OAuth, and bcrypt password hashing
- **Brute-force protection** — Rate limiting on sensitive endpoints
- **Product catalog** — Categories, pricing, stock info, and cloud-hosted images via Cloudinary
- **Cart & Orders** — Add to cart, place orders, full order history
- **Wishlist** — Save products for later
- **Reviews** — Leave ratings and written reviews on products
- **Coupons** — Apply discount codes at checkout
- **Multilingual UI** — English and Hungarian support via `vue-i18n`
- **Email notifications** — Transactional emails via Nodemailer
- **Toast notifications** — Real-time feedback with Vue Toastification

-----

## 🛠️ Tech Stack

### Frontend

|Technology                |Purpose             |
|--------------------------|--------------------|
|Vue.js 3 (Composition API)|UI framework        |
|Vite                      |Build tool          |
|Pinia                     |State management    |
|Vue Router                |Client-side routing |
|Axios                     |HTTP client         |
|Bootstrap 5               |Styling             |
|Vue I18n                  |Internationalization|
|Vue3 Google Login         |Google OAuth        |

### Backend

|Technology             |Purpose                          |
|-----------------------|---------------------------------|
|Node.js + Express.js v5|Server & REST API                |
|MongoDB + Mongoose     |Database & ODM                   |
|JWT + Bcrypt.js        |Authentication & password hashing|
|Google Auth Library    |OAuth verification               |
|Multer + Cloudinary    |Image upload & cloud storage     |
|Nodemailer             |Email sending                    |
|express-validator      |Input validation                 |
|Express Rate Limit     |Brute-force protection           |

-----

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB instance (local or Atlas)
- Cloudinary account
- Google OAuth credentials

-----

## 📁 Project Structure

```
bolt-ajax/
├── bolt-ajax/        # Vue 3 frontend
├── bolt-backend/     # Node.js/Express backend
└── kepek/            # Project images
```

-----

## 👤 Author

**Németh Noel**

- GitHub: [@noelnemeth](https://github.com/noelnemeth)
- LinkedIn: [noel-németh](https://www.linkedin.com/in/noel-n%C3%A9meth-26a6873a7/)