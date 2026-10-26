import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyDtqlrAV5VDk98_9iHlEpbBozdyZNKAgGw",
  authDomain: "golden-wears.firebaseapp.com",
  projectId: "golden-wears",
  storageBucket: "golden-wears.firebasestorage.app",
  messagingSenderId: "215953923432",
  appId: "1:215953923432:web:f8c93daa03d551cd950add",
  measurementId: "G-K8GRJF2ZJR",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const totalOrders = document.getElementById("totalOrders");
const activeDeliveries = document.getElementById("activeDeliveries");
const recentOrders = document.getElementById("recentOrders");
const ordersSection = document.getElementById("orders");

const customerName = document.getElementById("customerName");
const customerEmail = document.getElementById("customerEmail");
const customerAvatar = document.getElementById("customerAvatar");

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");

onAuthStateChanged(auth, function (user) {
  if (user) {
    let name = user.displayName;

    if (!name && user.email) {
      name = user.email.split("@")[0];
    }

    if (!name) {
      name = "Customer";
    }

    customerName.textContent = name;
    customerEmail.textContent = user.email || "No email available";
    customerAvatar.textContent = name.charAt(0).toUpperCase();

    profileName.textContent = user.displayName || name;
    profileEmail.textContent = user.email || "No email available";
    displayOrders(user);
  } else {
    window.location.href = "signin.html";
  }
});

const sectionLinks = document.querySelectorAll("[data-section]");
const dashboardSections = document.querySelectorAll(".dashboard-section");

sectionLinks.forEach(function (link) {
  link.addEventListener("click", function (event) {
    event.preventDefault();

    let sectionId = link.dataset.section;

    dashboardSections.forEach(function (section) {
      if (section.id === sectionId) {
        section.classList.remove("hidden-section");
      } else {
        section.classList.add("hidden-section");
      }
    });

    document.querySelectorAll(".sidebar-link").forEach(function (item) {
      item.classList.remove("active");
    });

    document.querySelectorAll(".sidebar-link").forEach(function (item) {
      if (item.dataset.section === sectionId) {
        item.classList.add("active");
      }
    });

    window.location.hash = sectionId;
  });
});

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", function () {
  signOut(auth)
    .then(function () {
      window.location.href = "signIn.html";
    })
    .catch(function (error) {
      console.log("Logout error:", error.message);
    });
});


let savedWishlist = JSON.parse(
    localStorage.getItem("goldenWearsWishlist")
) || [];

let wishlistProducts = document.getElementById("wishlistProducts");
let emptyWishlist = document.getElementById("emptyWishlist");
let dashboardWishlistCount = document.getElementById("wishlistCount");

function displayWishlist() {
    savedWishlist = JSON.parse(
        localStorage.getItem("goldenWearsWishlist")
    ) || [];

    wishlistProducts.innerHTML = "";

    if (dashboardWishlistCount) {
        dashboardWishlistCount.textContent = savedWishlist.length;
    }

    if (savedWishlist.length === 0) {
        emptyWishlist.style.display = "block";
        return;
    }

    emptyWishlist.style.display = "none";

    for (let i = 0; i < savedWishlist.length; i++) {
        wishlistProducts.innerHTML += `
            <div class="wishlist-product">
                <img
                    src="${savedWishlist[i].image}"
                    alt="${savedWishlist[i].name}"
                >

                <div class="wishlist-product-info">
                    <p>${savedWishlist[i].category}</p>
                    <h3>${savedWishlist[i].name}</h3>
                    <h4>₦${savedWishlist[i].price.toLocaleString()}</h4>

                    <button
                        class="remove-wishlist-btn"
                        onclick="removeFromWishlist(${i})"
                    >
                        Remove
                    </button>
                </div>
            </div>
        `;
    }
}

function removeFromWishlist(index) {
    savedWishlist.splice(index, 1);

    localStorage.setItem(
        "goldenWearsWishlist",
        JSON.stringify(savedWishlist)
    );

    displayWishlist();
}

window.removeFromWishlist = removeFromWishlist;

displayWishlist();

let allOrders = document.getElementById("allOrders");

async function displayOrders(user) {
  allOrders.innerHTML = `
    <div class="empty-state">
      <i class="bi bi-hourglass-split"></i>
      <h3>Loading your orders...</h3>
    </div>
  `;

  try {
    let ordersQuery = query(
      collection(db, "orders"),
      where("userId", "==", user.uid)
    );

    let querySnapshot = await getDocs(ordersQuery);

    let orders = [];

    querySnapshot.forEach(function (document) {
      orders.push({
        id: document.id,
        ...document.data()
      });
    });

   
    orders.sort(function (a, b) {
      let dateA = a.createdAt ? a.createdAt.toMillis() : 0;
      let dateB = b.createdAt ? b.createdAt.toMillis() : 0;

      return dateB - dateA;
    });

    totalOrders.textContent = orders.length;

    let activeCount = 0;

    for (let i = 0; i < orders.length; i++) {
      if (
        orders[i].orderStatus === "Pending" ||
        orders[i].orderStatus === "Processing" ||
        orders[i].orderStatus === "Shipped" ||
        orders[i].orderStatus === "Out for Delivery"
      ) {
        activeCount++;
      }
    }

    activeDeliveries.textContent = activeCount;

    if (orders.length === 0) {
      allOrders.innerHTML = `
        <div class="empty-state">
          <i class="bi bi-box-seam"></i>
          <h3>No orders to display</h3>
          <p>Your order history will appear here.</p>
          <a href="index.html" class="shop-btn">
            Start Shopping
          </a>
        </div>
      `;

      recentOrders.innerHTML = `
        <div class="empty-state">
          <i class="bi bi-bag"></i>
          <h3>No orders yet</h3>
          <p>Your purchases will appear here when you place an order.</p>
          <a href="index.html" class="shop-btn">
            Start Shopping
          </a>
        </div>
      `;

      return;
    }

    let ordersHTML = "";

    for (let i = 0; i < orders.length; i++) {
      let order = orders[i];

      let orderDate = "Date unavailable";

      if (order.createdAt) {
        orderDate = order.createdAt.toDate().toLocaleDateString(
          "en-NG",
          {
            day: "numeric",
            month: "short",
            year: "numeric"
          }
        );
      }

      let itemsHTML = "";

      if (Array.isArray(order.items)) {
        for (let j = 0; j < order.items.length; j++) {
          itemsHTML += `
            <div class="order-item">
              <span>
                ${order.items[j].name}
                × ${order.items[j].quantity}
              </span>
              <span>
                ₦${(
                  order.items[j].price *
                  order.items[j].quantity
                ).toLocaleString()}
              </span>
            </div>
          `;
        }
      }

      ordersHTML += `
        <div class="customer-order">
          <div class="customer-order-header">
            <div>
              <p class="eyebrow">ORDER PLACED</p>
              <h3>${orderDate}</h3>
              <p>Order ID: ${order.id}</p>
            </div>

            <div class="order-status">
              ${order.orderStatus || "Pending"}
            </div>
          </div>

          <div class="customer-order-items">
            ${itemsHTML}
          </div>

          <div class="customer-order-footer">
            <div>
              <p>Payment: ${order.paymentMethod || "Not specified"}</p>
              <p>Payment Status: ${order.paymentStatus || "Pending"}</p>
              <h3>Total: ₦${Number(order.total || 0).toLocaleString()}</h3>
            </div>

            <a
              href="orderConfirmation.html?orderId=${encodeURIComponent(order.id)}"
              class="shop-btn"
            >
              View Details
            </a>
          </div>
        </div>
      `;
    }

    allOrders.innerHTML = ordersHTML;

   
    let recentHTML = "";

    let recentLimit = Math.min(orders.length, 3);

    for (let i = 0; i < recentLimit; i++) {
      let order = orders[i];

      recentHTML += `
        <div class="recent-order-item">
          <div>
            <h3>Order #${order.id.slice(0, 8)}</h3>
            <p>${order.orderStatus || "Pending"}</p>
          </div>

          <div>
            <h3>₦${Number(order.total || 0).toLocaleString()}</h3>
            <a href="orderConfirmation.html?orderId=${encodeURIComponent(order.id)}">
              View Details
            </a>
          </div>
        </div>
      `;
    }

    recentOrders.classList.remove("empty-state");
    recentOrders.innerHTML = recentHTML;

  } catch (error) {
    console.log("Error loading orders:", error.message);

    allOrders.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-exclamation-circle"></i>
        <h3>Unable to load orders</h3>
        <p>Please refresh the page and try again.</p>
      </div>
    `;
  }
}

