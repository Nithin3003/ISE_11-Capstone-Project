📚 Study Search
A Unified Educational Resource Search Engine with Intelligent Ranking

A full-stack federated search engine that retrieves and ranks educational resources from YouTube, GitHub, arXiv, and Kaggle — built using HTML5, CSS3, JavaScript, PHP, and MySQL (XAMPP).

🚀 Overview

Study Search solves the problem of browsing multiple platforms separately for educational content.
It provides a single smart interface that offers:

🔍 Unified search

⭐ Intelligent ranking

🎯 Personalized recommendations

🔐 Secure login system

📊 Admin dashboard

⚡ Fast, clean, responsive UI

🎯 Features
🔹 1. Federated Search (Multi-platform)

Search simultaneously across:

📺 YouTube – Tutorials and educational videos

💻 GitHub – Code repositories

📄 arXiv – Research papers

📊 Kaggle – Datasets

🔹 2. Intelligent Ranking

Uses platform-specific formulas:

Platform	Ranking Factors
YouTube	Likes + Views
GitHub	Stars + Forks
arXiv	Recency score
Kaggle	Downloads + Usability
🔹 3. Personalized Recommendation System

Based on:

Search history

User behaviour

Ranked result logs

🔹 4. Secure Authentication

Registration & Login

Password hashing

Session handling

🔹 5. Admin Dashboard

Admin can view:

All users

Feedback

Search logs

Database tables

🔹 6. Modern UI Features

Responsive layout

Skeleton loaders (CSS animations)

Card-based results display

Clean intuitive design

🛠 Tech Stack
Frontend

HTML5

CSS3

JavaScript

Backend

PHP (v8.x)

MySQL (XAMPP)

APIs Used

YouTube Data API v3

GitHub REST API

arXiv API

Kaggle API

Tools

XAMPP

VS Code

GitHub

🗄 Database Structure
Tables Included

users

search_history

feedback

recommendations

All tables are linked for ranking, suggestions, and admin monitoring.

🔄 System Workflow

User logs in.

Enters a search query.

Selects category → Videos / Code / Papers / Datasets.

Backend fetches API results.

Ranking algorithm sorts and displays results.

Search saved → used for recommendations.

User can submit feedback.

Admin can view all stored data.

📂 Project Folder Structure
Study-Search/
│── index.html
│── login.php
│── register.php
│── home.php
│── search.php
│── recommendations.php
│── feedback.php
│── /api
│    ├── youtube.php
│    ├── github.php
│    ├── arxiv.php
│    └── kaggle.php
│── /assets
│    ├── css/
│    ├── js/
│    └── images/
│── /database
│    ├── db_connect.php
│    ├── create_tables.sql
│── README.md

🧪 Testing & Evaluation
⚙ Functional

Works across all modules

Ranking validated

APIs returning consistent results

🎨 Usability

User-friendly

Responsive

Clean layout

⚡ Performance
Component	Avg. Time
YouTube API	2.1s
GitHub API	1.8s
arXiv API	1.6s
Kaggle API	2.3s
DB Queries	<0.5s
🔐 Security

Password hashing

SQL Injection protection

Session expiry

🔌 How to Run (XAMPP)

Install XAMPP.

Move project folder to:

C:/xampp/htdocs/


Start Apache & MySQL.

Create the database using create_tables.sql in phpMyAdmin.

Visit:

http://localhost/Study-Search/

🔮 Future Enhancements

AI-based ranking (TF-IDF, semantic embeddings)

Cloud hosting (AWS / Azure)

Chatbot-based smart queries

Multi-language search

Interactive analytics dashboard
