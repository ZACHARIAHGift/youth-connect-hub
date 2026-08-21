# Youth Connect Hub

This is exactly the kind of project where a detailed prompt pays off. Since you're using an AI builder like Lovable, the prompt should describe the product, the users, the experience, the UI, the database, and the expected behavior, not just the features.

Here's a much more comprehensive prompt.

COMMUNITY NEWSLETTER CMS FOR A YOUTH CLUB

Master AI Prompt (Final Year Project)

Project Overview

Build a modern, production-quality Community Newsletter Content Management System (CMS) for a Youth Club. The platform should serve as a centralized digital space where youth club administrators can create, manage, organize, and publish newsletters, announcements, event updates, volunteer opportunities, educational articles, inspirational stories, and community news.

This application must not resemble a basic CRUD project. It should feel like a professional content management platform that a real youth organization would use daily.

The application should have an elegant, modern, and premium interface with smooth animations, excellent typography, intuitive navigation, and a fully responsive design that works seamlessly across desktop, tablet, and mobile devices.

The visual identity should use a Red, White, and Black color palette:

Primary Color: #C1121F (Rich Red)

Secondary Color: #FFFFFF (White)

Accent Color: #111111 (Black)

Background: White with subtle gray sections

Success: Green

Warning: Amber

Error: Crimson

The design should communicate professionalism, leadership, community engagement, and youth empowerment.

Project Purpose

The purpose of this CMS is to simplify how a youth club creates and publishes newsletters while giving members an engaging platform to stay informed about club activities.

The CMS should allow administrators to manage all content from a secure dashboard while providing readers with an enjoyable reading experience.

User Roles

Administrator

Administrators should be able to:

Securely log in

Access an analytics dashboard

Create articles

Edit articles

Delete articles

Save drafts

Publish articles

Unpublish articles

Upload featured images

Add multiple images inside articles

Assign categories

Add tags

Schedule future publication (optional)

View article statistics

Manage homepage featured content

Manage newsletter subscriptions (optional)

Public Visitors

Visitors should be able to:

View the homepage

Browse published articles

Search articles instantly

Filter articles

Read full articles

Like articles

View popular articles

View recent articles

Browse by category

Share articles

Subscribe to newsletters (optional)

Visitors should not require authentication.

Authentication

Create a professional authentication system.

Features:

Login page

Remember Me

Forgot Password

Password validation

Protected Admin Dashboard

Logout

Use Supabase Authentication.

Homepage Design

The homepage should look like a modern news website.

Include:

Hero Section

Large banner with:

Featured newsletter

Background image

Call-to-action button

Latest headline

Featured Articles

Grid of featured stories with beautiful cards.

Each card contains:

Featured image

Title

Short excerpt

Author

Date

Category

Reading time

Number of likes

Recent News

Display the latest published articles.

Upcoming Events

Beautiful cards showing:

Event title

Date

Venue

Registration button

Popular Articles

Display articles with the highest views and likes.

Categories Section

Show categories as colorful clickable cards.

Examples:

Announcements

Community Projects

Youth Development

Leadership

Volunteer Activities

Workshops

Success Stories

Health Awareness

Education

Sports

Newsletter Subscription

Simple email subscription section with a modern design.

Footer

Include:

About Youth Club

Contact

Social Media Icons

Quick Links

Copyright

Admin Dashboard

Create a premium dashboard similar to modern SaaS applications.

Display analytics cards:

Total Articles

Published Articles

Draft Articles

Total Categories

Total Views

Total Likes

Most Viewed Article

Most Liked Article

Charts:

Monthly Published Posts

Monthly Views

Monthly Likes

Category Distribution

Recent Activity:

Recently Published

Drafts

Recent Likes

Quick Actions:

Create Article

Manage Articles

Manage Categories

View Website

Article Management

Create a complete post management system.

Each article contains:

Title

Subtitle

Featured Image

Rich Text Content

Category

Tags

Status

Author

Date

Reading Time

SEO Description

Slug

Actions:

Create

Save Draft

Publish

Edit

Delete

Preview

Rich Text Editor

Support:

Headings

Paragraphs

Bold

Italic

Underline

Blockquotes

Numbered Lists

Bullet Lists

Links

Images

Code Blocks

Tables

Alignment

Undo/Redo

Live Preview

Search System

Implement real-time search.

Search by:

Title

Tags

Category

Content

Author

Filters:

Newest

Oldest

Most Viewed

Most Liked

Individual Article Page

Each article should display:

Large featured image

Title

Subtitle

Author information

Publication date

Estimated reading time

Category

Tags

Views

Likes

Beautiful typography

Related articles

Share buttons

Previous/Next article navigation

Analytics

Automatically track:

Article views

Likes

Most popular article

Total visitors (mock data is acceptable)

Monthly statistics

Dashboard graphs

UI/UX Requirements

The interface should feel polished and premium.

Include:

Glassmorphism effects where appropriate

Smooth page transitions

Hover animations

Loading skeletons

Toast notifications

Responsive navigation

Sticky navbar

Scroll-to-top button

Elegant cards

Rounded corners

Soft shadows

Smooth micro-interactions

Dark Mode

Include a dark mode toggle.

Dark Mode colors:

Background: #0D0D0D

Cards: #181818

Text: White

Primary Accent: Red

Mobile Responsiveness

The application must work perfectly on:

Desktop

Laptop

Tablet

Mobile

All layouts should adapt gracefully.

Database Structure

Create tables for:

Users

Posts

Categories

Tags

PostTags

Likes

Views

NewsletterSubscribers (optional)

Each post should contain:

ID

Title

Slug

Content

Excerpt

Featured Image

Category

Author

Status

Views

Likes

Created At

Updated At

Published At

Sample Content

Populate the CMS with realistic Youth Club content.

Examples:

Community Clean-up Campaign

Youth Leadership Conference

Digital Skills Bootcamp

Mental Health Awareness Week

Volunteer Spotlight

Career Development Workshop

Environmental Sustainability Project

Scholarship Opportunities

Sports Festival

Community Outreach Program

Include realistic images and engaging article excerpts.

Performance

Optimize for:

Fast loading

Lazy-loaded images

Optimized routing

Reusable components

Clean folder structure

Accessibility best practices

SEO-friendly URLs

Technology Stack

Use:

React

TypeScript

Tailwind CSS

Supabase

React Router

React Hook Form

Zod

Lucide Icons

Framer Motion for animations

TanStack Query (React Query)

Deliverables

The completed project should include:

A professional homepage

Fully functional admin dashboard

Authentication

Rich text editor

CRUD functionality

Responsive design

Analytics dashboard

Search and filters

Like system

View counter

Categories and tags

Sample content

Clean architecture

Production-quality UI

Ready for deployment to Vercel or Netlify

Well-structured codebase suitable for a university final-year project

Final Instruction to the AI

Build this application as if it were being developed for a real Youth Club organization. Prioritize clean architecture, reusable components, excellent user experience, accessibility, responsive design, and production-quality visuals. The finished application should be impressive enough to serve as a university final-year project and portfolio piece, demonstrating both strong frontend development skills and thoughtful product design.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8d5595cd-1b1f-41bc-a736-5b0eec847107).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
