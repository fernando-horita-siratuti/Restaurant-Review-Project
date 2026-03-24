<div align="center">
  <img src="/public/images/logo.png" alt="Dine-SP logo" width="100%">
</div>

# Dine SP - Restaurant Review Platform

A full-stack web application designed for users to explore, view and post reviews of restaurants across the city of São Paulo. The system features dynamic filtering, sorting algorithms, secure authentication, a relational database and a fully responsive mobile-first UI.

<div align="center">

![Maintained](https://img.shields.io/badge/Maintained-yes-green.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=flat&logo=bootstrap&logoColor=white)
![Contributions](https://img.shields.io/badge/contributions-welcome-green.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

</div>

---

## 📑 Table of Contents
- [🎯 Features](#features)
- [📸 Preview](#preview)
- [🌐 Live Demo](#live-demo)
- [📋 Requirements](#requirements)
- [🗄️ Database Architecture](#database-architecture)
- [💡 Basic Usage](#basic-usage)
- [📁 Project Structure](#project-structure)
- [⚙️ Technical Details](#technical-details)
- [⚠️ Project Limitations](#project-limitations)
- [🗺️ Future Improvements](#future-improvements)
- [📄 License](#license)
- [💭 Credits](#credits)
- [📬 Contact Me](#contact-me)

---

## <a id="features"></a>🎯 Features

- **Secure Authentication**: Users can register and log in securely using Google OAuth 2.0 integration.
- **Relational Database**: Persistent data storage handling user profiles and community restaurant reviews.
- **Dynamic Restaurant Search**: Filter establishments by specific neighborhoods and cuisines in São Paulo, featuring geolocation capabilities to find places near the user.
- **Smart Sorting System**: Order restaurant results by A-Z (Default), Highest Rated, Lowest Price or Highest Price.
- **Automated Statistics**: The system dynamically calculates average ratings, total reviews and top preferences for user profiles.
- **Responsive Design**: Fully optimized for mobile devices with responsive cards, dropdowns and custom pagination.

## <a id="preview"></a>📸 Preview

Here are some screenshots of the main user flow:

| Home Page (Search) | Search Results |
| :---: | :---: |
| <img src="/public/images/home.png" width="400" alt="Home Page"> | <img src="/public/images/restaurantCards.png" width="400" alt="Restaurant Cards"> |
| **Reading a Review** | **Posting a Review** |
| <img src="/public/images/reviewCard.png" width="400" alt="Review Card"> | <img src="/public/images/review.png" width="400" alt="Review Page"> |
| **My Profile (Private)** | **Other User's Profile (Public)** |
| <img src="/public/images/ownProfile.png" width="400" alt="Own Profile Page"> | <img src="/public/images/otherUserProfile.png" width="400" alt="Other User Profile Page"> |

## <a id="live-demo"></a>🌐 Live Demo

The application is successfully deployed and hosted online! You can test all the features directly in your browser.

👉 **[Click here to access Dine SP](https://dine-sp.onrender.com/)**

*(Note: The platform is currently hosted on a free Render instance. If the site hasn't been visited in a while, the server may go to sleep. It might take around 40-50 seconds to load initially as the server wakes up).*

## <a id="requirements"></a>📋 Requirements

- **Web Browser**: Chrome, Firefox, Safari or Edge
- **Internet Connection**: Required for fetching public API data, authenticating via Google and loading CDNs.

## <a id="database-architecture"></a>🗄️ Database Architecture

This project utilizes a robust backend architecture, combining a public API for location data with a custom PostgreSQL relational database for user-generated content.

### 1. PostgreSQL Database (Backend Storage)
The application relies on a cloud-hosted PostgreSQL database to ensure data persistence, security and complex relationship mapping. The schema is divided into two main tables:
- **`users` Table**: Handles authentication data, storing secure profiles.
- **`reviews` Table**: Stores the core content submitted by users, including the restaurant name, neighborhood, cuisine, rating, price range, date visited and the textual feedback. It holds a foreign key linking back to the `users` table.

### 2. Geoapify API (Location & Establishment Data)
- **What it provides**: Dynamic fetching of establishment names, addressesand categories.
- **Usage**: Used to populate the "Restaurants Found" list based on the user's filters.

## <a id="basic-usage"></a>💡 Basic Usage

1. **Home Page**: Select a **Neighborhood** and a **Cuisine** from the dropdown menus.
2. **Search Results**: Browse the generated list of restaurants. Use the top-right dropdown to sort the results.
3. **View Reviews**: Click "See the reviews" on any restaurant card to read what the community is saying.
4. **Post a Review**: Log in, fill out the form providing your rating, date visited and review text. Submit to see it instantly added to the platform and reflected in your public user profile stats.

## <a id="project-structure"></a>📁 Project Structure

```text
public/                 # Static assets
├── css/
│   └── style.css       # Custom stylesheets (Mobile-first)
├── js/
|   └── review.js
└── images/             # Backgrounds, Chef Hat pagination icons, etc.
views/                  # EJS Templates
| └── partials
|     └── footer.ejs
|     └── header.ejs
└── index.ejs           # Main dynamic view
.env                    # API key, google client id, etc.
index.js                # Express server, DB connections and routing logic
LICENSE                 # MIT License
package.json            # Project metadata and dependencies
README.md               # This file
```

## <a id="technical-details"></a>⚙️ Technical Details

### SQL Subqueries and Aggregations
The backend extensively uses complex SQL queries to deliver a seamless frontend experience. For example, user profiles dynamically display statistics (Total Reviews, Top Neighborhood, Top Cuisine) using nested `SELECT` and `GROUP BY` subqueries, calculating the user's habits in real-time.

### Authentication Flow
User sessions are managed securely. When a user authenticates via Google, the backend verifies the credentials, establishes a secure session cookie and restricts access to specific routes (like posting, editing, or deleting reviews) only to authenticated users.

## <a id="project-limitations"></a>⚠️ Project Limitations

As this is a learning project, there are a few technical limitations to be aware of:

### Public API Inaccuracies
All restaurant data is fetched dynamically from a free public [API](https://apidocs.geoapify.com/docs). Unfortunately, this API is not 100% precise, which means you might encounter some data inconsistencies while browsing the platform, such as:
- Missing street numbers in some restaurant addresses.
- Incorrect address locations.
- Misspelled or incorrectly formatted restaurant names.
- Incomplete database coverage, meaning some restaurants might not be retrievable by the API.

## <a id="future-improvements"></a>🗺️ Future Improvements

As I continue to learn and evolve this project, the following features are planned for future updates:

### 1. Enhanced Restaurant Details & Reservations
Integrate advanced APIs to fetch comprehensive restaurant data, including official websites, dish photos and full menus. Additionally, implement a reservation system allowing users to book tables directly through the Dine SP platform.

### 2. Michelin Star Recognition API
Integrate an advanced API capable of identifying if a restaurant has been awarded Michelin stars. Highlighting these prestigious establishments with special UI badges will instantly attract users' attention and provide a premium layer of information to the platform.

## <a id="license"></a>📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## <a id="credits"></a>💭 Credits

I would like to thank [Angela Yu](https://github.com/angelabauer) for providing this great exercise from her [course](https://www.udemy.com/course/the-complete-web-development-bootcamp/?couponCode=LOCLZDOFFPBRCTRL). 

## <a id="contact-me"></a>📬 Contact Me

<div align="center">
  
  <br><br>
    <i>Fernando Horita Siratuti - Undergraduate - 5th Semester, Computer Engineering @ CEFET-MG</i>
  <br><br>
  
  [![Gmail][gmail-badge]][gmail-autor]
  [![Linkedin][linkedin-badge]][linkedin-autor]
  [![GitHub][github-badge]][github-autor]
  [![Instagram][instagram-badge]][instagram-autor]

</div>

[gmail-badge]: https://img.shields.io/badge/-Gmail-c14438?style=flat-square&logo=Gmail&logoColor=white
[linkedin-badge]: https://img.shields.io/badge/-LinkedIn-blue?style=flat-square&logo=Linkedin&logoColor=white
[github-badge]: https://img.shields.io/badge/-GitHub-181717?style=flat-square&logo=github&logoColor=white
[instagram-badge]: https://img.shields.io/badge/-Instagram-E4405F?style=flat-square&logo=instagram&logoColor=white
[![Hypercommit](https://img.shields.io/badge/Hypercommit-DB2475)](https://hypercommit.com/dinesp)

[gmail-autor]: mailto:siratutifernando@gmail.com
[linkedin-autor]: https://www.linkedin.com/in/fernando-siratuti-503ba8301/
[github-autor]: https://github.com/fernando-horita-siratuti
[instagram-autor]: https://www.instagram.com/siratuti_/