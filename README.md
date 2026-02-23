<div align="center">
  <img src="/public/images/logo.png" alt="Dine-SP logo" width="100%">
</div>

# Dine SP - Restaurant Review Platform

A full-stack web application designed for users to explore, view and post reviews of restaurants across the city of São Paulo. The system features dynamic filtering, sorting algorithms and a fully responsive mobile-first UI.

<div align="center">

![Maintained](https://img.shields.io/badge/Maintained-yes-green.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=flat&logo=bootstrap&logoColor=white)
![Contributions](https://img.shields.io/badge/contributions-welcome-green.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

</div>

---

## Table of Contents
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Data Sources](#data-sources)
- [Basic Usage](#basic-usage)
- [Project Structure](#project-structure)
- [Technical Details](#technical-details)
- [Project Limitations](#project-limitations)
- [Future Improvements](#future-improvements)
- [License](#license)
- [Contact Me](#contact-me)

---

## Features

- **Dynamic Restaurant Search**: Filter establishments by specific neighborhoods and cuisines in São Paulo.
- **Smart Sorting System**: Order restaurant results by A-Z (Default), Highest Rated, Lowest Price or Highest Price.
- **Community Reviews**: Users can post detailed reviews including ratings (0-10), price ranges ($ to $$$$$), date visited and textual feedback.
- **Automated Statistics**: The system dynamically calculates average ratings and price ranges based on user-submitted reviews.
- **Responsive Design**: Fully optimized for mobile devices with responsive cards, dropdowns and custom pagination.
- **Public API Integration**: Fetches real restaurant data and locations dynamically.

## Preview

Here are some screenshots of the main user flow:

| Home Page (Search) | Search Results |
| :---: | :---: |
| <img src="/public/images/home.png" width="400" alt="Home Desktop"> | <img src="/public/images/restaurantCards.png" width="400" alt="Rstaurant Cards Desktop"> |
| **Reading a Review** | **Posting a Review** |
| <img src="/public/images/reviewCards.png" width="400" alt="Review Cards Desktop"> | <img src="/public/images/review.png" width="400" alt="Review Desktop"> |

## Requirements

- **Node.js**: v14.x or higher
- **npm**: v6.x or higher (Node Package Manager)
- **Web Browser**: Chrome, Firefox, Safari or Edge
- **Internet Connection**: Required for fetching public API data and Bootstrap CDNs.

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/fernando-horita-siratuti/Restaurant-Review-Project
```

### 2. Install Dependencies

Install all required Node.js packages (Express, EJS, etc.):

```bash
npm i
```

### 3. Run the Application

Start the local server:

```bash
node index.js
```
*Note: Alternatively, you can use `npm start` if configured in your package.json or use `nodemon index.js` if you have nodemon installed.*

### 4. Access the Platform

Open your web browser and navigate to:
```text
http://localhost:3000
```

## Data Sources

This project utilizes a hybrid data approach:

### 1. Public API - Restaurant Data
- **What it provides**: Dynamic fetching of establishment names, locations and categories (bakery, bar, etc.).
- **Usage**: Used to populate the "Restaurants Found" list based on the user's neighborhood and cuisine filters.

### 2. Local Storage (Client-Side) - Reviews Data
- **What it provides**: Persistence for user-generated content (username, rating, price range, date and review text).
- **Usage**: Simulates a database environment for the frontend, allowing dynamic calculation of average ratings and rendering of community feedback.

## Basic Usage

1. **Home Page**: Select a **Neighborhood** (e.g., Saúde, Liberdade, Pinheiros) and a **Cuisine** (e.g., Japanese, Italian, Brazilian Barbecue) from the dropdown menus.
2. **Search Results**: Browse the generated list of restaurants. Use the top-right dropdown to sort the results.
3. **View Reviews**: Click "See the reviews" on any restaurant card to read what the community is saying.
4. **Post a Review**: Fill out the elegant form providing your username, the restaurant name, neighborhood, cuisine, rating, date visited and your review text. Submit to see it instantly added to the platform.

## Project Structure

```text
DineSP/
├── node_modules/           # Ignored by git (generated via npm install)
├── public/                 # Static assets
│   ├── css/
│   │   └── style.css       # Custom stylesheets (Mobile-first)
│   └── images/             # Backgrounds, Chef Hat pagination icons, etc.
|        └── chefHat.png
|        └── logo.png
|        └── restaurant.png
├── views/                  # EJS Templates
|   | └── partials
|   |       └── footer.ejs
|   |       └── header.ejs
│   └── index.ejs           # Main dynamic view 
├── index.js                # Express server and routing logic
├── LICENSE                 # MIT License
├── package.json            # Project metadata and dependencies
├── package-lock.json       # Dependency version lock
└── README.md               # This file
```

## Technical Details

### Responsive Flexbox Layouts
The UI relies heavily on Bootstrap 5 utility classes combined with custom CSS Media Queries. Elements like the rating boxes, sorting dropdowns and tags (`d-block d-md-inline`) dynamically stack on mobile devices (`max-width: 767px`) to prevent horizontal overflow and overlapping.

### Dynamic Rendering
The backend uses **EJS (Embedded JavaScript templating)** to inject HTML dynamically based on the `req.query` parameters (Neighborhood, Cuisine, Page number). 

### Data Parsing and Normalization
To cross-reference API data with user reviews, the system normalizes strings by removing special characters and standardizing casing:
```javascript
const rawName = restTexts[i].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
```

## Project Limitations

As this is a learning project, there are a few technical limitations to be aware of:

### 1. No Real Database
Currently, this project does not utilize a backend database (like SQL or MongoDB) because I have not yet learned how to implement one. To simulate a database environment, all user reviews are temporarily stored in the browser's `localStorage`. This means that reviews are not shared between different users or devices, and they will be permanently lost if you clear your browser cache or use an Incognito window.

### 2. Public API Inaccuracies
All restaurant data is fetched dynamically from a free public [API](https://apidocs.geoapify.com/docs). Unfortunately, this API is not 100% precise, which means you might encounter some data inconsistencies while browsing the platform, such as:
- Missing street numbers in some restaurant addresses.
- Incorrect address locations.
- Misspelled or incorrectly formatted restaurant names.

## Future Improvements

As I continue to learn and evolve this project, the following features are planned for future updates:

### 1. Database Integration
Replace the current `localStorage` mock system with a robust backend database (such as PostgreSQL or MongoDB). This will allow reviews to be persistent, safely stored on a server, and accessible to all users across different devices.

### 2. Michelin Star Recognition API
Integrate an advanced API capable of identifying if a restaurant has been awarded Michelin stars. Highlighting these prestigious establishments with special UI badges will instantly attract users' attention and provide a premium layer of information to the platform.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact Me

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

[gmail-autor]: mailto:siratutifernando@gmail.com
[linkedin-autor]: https://www.linkedin.com/in/fernando-siratuti-503ba8301/
[github-autor]: https://github.com/fernando-horita-siratuti
[instagram-autor]: https://www.instagram.com/siratuti_/