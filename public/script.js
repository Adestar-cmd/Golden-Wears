import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDtqlrAV5VDk98_9iHlEpbBozdyZNKAgGw",
  authDomain: "golden-wears.firebaseapp.com",
  projectId: "golden-wears",
  storageBucket: "golden-wears.firebasestorage.app",
  messagingSenderId: "215953923432",
  appId: "1:215953923432:web:f8c93daa03d551cd950add",
  measurementId: "G-K8GRJF2ZJR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let navbarToggler = document.querySelector(".navbar-toggler");
let navbarToggleIcon = document.getElementById("navbarToggleIcon");

navbarToggler.addEventListener("click", function () {
  if (navbarToggleIcon.classList.contains("bi-list")) {
    navbarToggleIcon.classList.remove("bi-list");
    navbarToggleIcon.classList.add("bi-x-lg");
  } else {
    navbarToggleIcon.classList.remove("bi-x-lg");
    navbarToggleIcon.classList.add("bi-list");
  }
});

let products = [
  {
    name: "Classic Casual Shirt",
    price: 18500,
    category: "Men",
    image: "images/pro-1.avif",
  },
  {
    name: "Elegant Blouse",
    price: 15000,
    category: "Women",
    image: "images/pro-2.avif",
  },
  {
    name: "Kids Comfort Set",
    price: 12000,
    category: "Kids",
    image: "images/hero-kid.avif",
  },
  {
    name: "Essential Jacket",
    price: 28000,
    category: "Men",
    image: "images/hoodie-men.avif",
  },
  {
    name: "Classic Casual Shirt",
    price: 20000,
    category: "Men",
    image: "images/classic-men.jfif",
  },
  {
    name: "Essential Blouse",
    price: 10000,
    category: "Women",
    image: "images/blouse.jfif",
  },
  {
    name: "Kids Comfort Set",
    price: 20000,
    category: "Kids",
    image: "images/kid-set.jfif",
  },
  {
    name: "Comfort Shirt",
    price: 15000,
    category: "Kids",
    image: "images/kid-comfort.jfif",
  },
];

function displayProducts() {
  let productDisplay = document.getElementById("featuredProducts");

  productDisplay.innerHTML = "";

  for (let i = 0; i < products.length; i++) {
    productDisplay.innerHTML += `
      <div class="gw-product-card">

        <div class="gw-product-image">
          <img
            src="${products[i].image}"
            alt="${products[i].name}"
          >

          <button
            class="wishlist-btn"
            onclick="toggleWishlist(${i})"
            aria-label="Add to wishlist"
            type="button"
          >
            <i class="bi bi-heart"></i>
          </button>
        </div>

        <div class="gw-product-info">
          <p>${products[i].category}</p>
          <h3>${products[i].name}</h3>
          <h4>₦${Number(products[i].price).toLocaleString()}</h4>

          <button
            class="add-to-cart"
            onclick="addToCart(${i})"
          >
            Add to Cart
          </button>
        </div>

      </div>
    `;
  }

  updateWishlistButtons();
}

async function loadStoreProducts() {
  try {
    let productSnapshot = await getDocs(collection(db, "products"));

    for (let i = 0; i < productSnapshot.docs.length; i++) {
      let productData = productSnapshot.docs[i].data();

      products.push({
        id: productSnapshot.docs[i].id,
        name: productData.name,
        price: Number(productData.price),
        category: productData.category,
        image: productData.image,
        description: productData.description || "",
        stock: Number(productData.stock || 0)
      });
    }

    displayProducts();
  } catch (error) {
    console.log("Error loading store products:", error);
    displayProducts();
  }
}

loadStoreProducts();

let cart = JSON.parse(localStorage.getItem("goldenWearsCart")) || [];
let totalItems = 0;

for (let i = 0; i < cart.length; i++) {
  totalItems += cart[i].quantity;
}

cartCount.textContent = totalItems;

const addToCart = (index) => {
  let selectedProduct = products[index];
  let found = false;

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].name === selectedProduct.name) {
      cart[i].quantity++;
      found = true;
      break;
    }
  }

  if (found === false) {
    selectedProduct.quantity = 1;
    cart.push(selectedProduct);
  }

  localStorage.setItem("goldenWearsCart", JSON.stringify(cart));

  let cartCount = document.getElementById("cartCount");
  let totalItems = 0;

  for (let i = 0; i < cart.length; i++) {
    totalItems += cart[i].quantity;
  }

  cartCount.textContent = totalItems;
};


let wishlist = JSON.parse(
    localStorage.getItem("goldenWearsWishlist")
) || [];

function toggleWishlist(index) {
    let selectedProduct = products[index];
    let found = false;

    for (let i = 0; i < wishlist.length; i++) {
        if (
            wishlist[i].name === selectedProduct.name &&
            wishlist[i].image === selectedProduct.image
        ) {
            wishlist.splice(i, 1);
            found = true;
            break;
        }
    }

    if (found === false) {
        wishlist.push(selectedProduct);
    }

    localStorage.setItem(
        "goldenWearsWishlist",
        JSON.stringify(wishlist)
    );

    updateWishlistCount();
    updateWishlistButtons();
}

function updateWishlistCount() {
    let wishlistCount = document.getElementById("wishlistCount");

    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
    }
}

function updateWishlistButtons() {
    let wishlistButtons = document.querySelectorAll(".wishlist-btn");

    wishlistButtons.forEach(function(button, index) {
        let selectedProduct = products[index];
        let found = false;

        for (let i = 0; i < wishlist.length; i++) {
            if (
                wishlist[i].name === selectedProduct.name &&
                wishlist[i].image === selectedProduct.image
            ) {
                found = true;
                break;
            }
        }

        let heart = button.querySelector("i");

        if (found) {
            heart.classList.remove("bi-heart");
            heart.classList.add("bi-heart-fill");
            button.classList.add("wishlisted");
        } else {
            heart.classList.remove("bi-heart-fill");
            heart.classList.add("bi-heart");
            button.classList.remove("wishlisted");
        }
    });
}

updateWishlistCount();
updateWishlistButtons();


let newArrivals = [
  {
    name: "Everyday Essential outfit",
    price: 28000,
    category: "Men",
    image: "images/new-men.jfif",
  },
  {
    name: "Everyday Style Blouse",
    price: 20000,
    category: "Women",
    image: "images/new-women.jfif",
  },
  {
    name: "Little Comfort Outfit",
    price: 12000,
    category: "Kids",
    image: "images/kid-comfort.jfif",
  },
  {
    name: "Classic Casual Shirt",
    price: 18500,
    category: "Men",
    image: "images/new-men 1.jfif",
  },
];

let arrivalsDisplay = document.getElementById("newArrivals");

for (let i = 0; i < newArrivals.length; i++) {
  arrivalsDisplay.innerHTML += `
        <div class="gw-arrival-card">
            <div class="gw-arrival-image-wrap">
                <img class="gw-arrival-image"
                     src="${newArrivals[i].image}"
                     alt="${newArrivals[i].name}">
                <span class="gw-arrival-tag">NEW</span>
            </div>

            <div class="gw-arrival-info">
                <p>${newArrivals[i].category}</p>
                <h3>${newArrivals[i].name}</h3>
                <span>₦${newArrivals[i].price.toLocaleString()}</span>
            </div>
        </div>
    `;
}

window.addToCart = addToCart;
window.toggleWishlist = toggleWishlist;
