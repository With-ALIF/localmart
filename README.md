# E-Shop Essentials

E-commerce Customer App — First 10 Features

React + Vite + Tailwind CSS ব্যবহার করে একটি আধুনিক, professional এবং responsive E-commerce Customer Web App তৈরি করো।

এই ধাপে শুধুমাত্র নিচের প্রথম ১০টি feature implement করতে হবে। Supabase, real authentication, checkout, payment এবং order system এখন তৈরি করবে না।

1. Home / Dashboard

Customer website-এ প্রবেশ করলে সরাসরি Home Dashboard দেখতে পাবে।

Home page-এ থাকবে:

Hero Promotional Banner

Category Section

Popular Products

Special Offers

New Arrivals

Featured/Recommended Products

Responsive layout

"View All" navigation

Home page অবশ্যই modern এবং visually polished হতে হবে।

2. Header

Responsive Header তৈরি করো।

Desktop:

Website Logo

Website Name

Search Bar

Wishlist Icon

Cart Icon

Cart Item Count

Login/Register Button

Mobile:

Logo

Cart

Hamburger Menu

Mobile menu-তে থাকবে:

Home

Categories

Products

Offers

Wishlist

Login/Register

Header sticky রাখা যেতে পারে।

3. Hero Banner

Reference image-এর মতো modern promotional banner তৈরি করো।

থাকবে:

Large heading

Short promotional description

"এখনই কেনাকাটা করুন" button

Promotional image

Discount/offer badge

Previous/Next controls

কমপক্ষে 2–3টি banner রাখো।

Banner slider functional হতে হবে।

4. Category Section

"ক্যাটাগরি" section তৈরি করো।

Categories:

মুদি

চাল ও ডাল

তেল

পানীয়

নাস্তা

পোশাক

ইলেকট্রনিক্স

অন্যান্য

প্রতিটি Category Card-এ থাকবে:

Icon/Image

Category Name

Product Count

Category card clickable হবে।

Click করলে সংশ্লিষ্ট category/product listing page-এ navigate করবে।

Mobile-এ horizontal scrolling ব্যবহার করা যেতে পারে।

5. Product Search

Frontend-level functional search system তৈরি করো।

Customer:

Product name দিয়ে search করতে পারবে

Description দিয়ে search করতে পারবে

Search result দেখতে পারবে

Search clear করতে পারবে

No result হলে সুন্দর empty state দেখতে পাবে

Header Search Bar এবং Product Listing Search একই mock product data ব্যবহার করবে।

Search case-insensitive হতে হবে।

6. Product Listing

একটি reusable Product Listing page তৈরি করো।

Product Card-এ থাকবে:

Product Image

Product Name

Short Description

Current Price

Previous Price

Discount

Rating

Review Count

Stock Status

Wishlist Button

Add to Cart Button

Product grid responsive হবে।

Desktop, tablet এবং mobile অনুযায়ী column সংখ্যা পরিবর্তন হবে।

7. Product Filtering & Sorting

Product Listing page-এ filtering এবং sorting যোগ করো।

Filters:

Category

Price Range

Rating

Availability

Sorting:

জনপ্রিয়

নতুন

দাম: কম থেকে বেশি

দাম: বেশি থেকে কম

Rating

Filter এবং sort করলে product list instantly update হবে।

8. Product Details

Product Details page তৈরি করো।

থাকবে:

Large Product Image

Thumbnail Images

Product Name

Description

Current Price

Previous Price

Discount

Rating

Review Count

Stock Status

Quantity Selector

Add to Cart Button

Wishlist Button

Product Information

Related Products

Product Card click করলে Product Details page-এ navigate করবে।

9. Add to Cart

Login ছাড়াই customer product Cart-এ add করতে পারবে।

Features:

Add to Cart

Increase Quantity

Decrease Quantity

Remove Product

Cart Item Count

Subtotal

Discount

Total

Empty Cart State

Continue Shopping

Cart data localStorage-এ সংরক্ষণ করো, যাতে page refresh করলেও cart data থাকে।

Add to Cart করলে Header-এর cart count সঙ্গে সঙ্গে update হবে।

10. Wishlist

Frontend-level Wishlist system তৈরি করো।

Customer:

Product wishlist-এ add করতে পারবে

Wishlist থেকে remove করতে পারবে

Wishlist page দেখতে পারবে

Wishlist item Cart-এ add করতে পারবে

Wishlist count দেখতে পারবে

Wishlist data localStorage-এ সংরক্ষণ করো।

Wishlist button product card এবং Product Details—দুই জায়গাতেই থাকবে।

Technology

ব্যবহার করবে:

React

Vite

Tailwind CSS

React Router

Lucide React

JavaScript

Mock/Dummy Data

localStorage

Design

Reference image-এর মতো:

Green/Teal theme

Clean white background

Rounded cards

Subtle shadows

Modern typography

Proper spacing

Smooth hover effects

Mobile-first responsive design

Professional Bangla + English typography

Static screenshot-এর মতো শুধু UI তৈরি করবে না। Search, routing, filtering, sorting, cart এবং wishlist functional হতে হবে।

এই ধাপে Supabase বা real authentication ব্যবহার করবে না।

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a831e1c1-f3c8-4847-a5ff-f2d8956ec156).

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
