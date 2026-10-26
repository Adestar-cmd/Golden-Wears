import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
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

let currentUser = null;

onAuthStateChanged(auth, function (user) {
  if (user) {
    currentUser = user;
  } else {
    window.location.href = "signIn.html?returnTo=checkout.html";
  }
});

let cart = JSON.parse(localStorage.getItem("goldenWearsCart")) || [];

let checkoutItems = document.getElementById("checkoutItems");
let checkoutSubtotal = document.getElementById("checkoutSubtotal");
let checkoutTotal = document.getElementById("checkoutTotal");
let deliveryFeeDisplay = document.getElementById("deliveryFee");
let checkoutForm = document.getElementById("checkoutForm");
let checkoutMessage = document.getElementById("checkoutMessage");

let subtotal = 0;
let deliveryFee = 2000; 
let total = 0;

function displayCheckout() {
  subtotal = 0;
  total = 0;

  checkoutItems.innerHTML = "";

  if (cart.length === 0) {
    checkoutItems.innerHTML = `
            <p>Your cart is empty.</p>
            <a href="index.html">Continue Shopping</a>
        `;

    checkoutSubtotal.textContent = "₦0";
    deliveryFeeDisplay.textContent = "₦0";
    checkoutTotal.textContent = "₦0";

    checkoutForm.querySelector("button[type='submit']").disabled = true;
    return;
  }

  checkoutForm.querySelector("button[type='submit']").disabled = false;

  for (let i = 0; i < cart.length; i++) {
    checkoutItems.innerHTML += `
            <div class="checkout-item">
                <img src="${cart[i].image}" alt="${cart[i].name}">

                <div class="checkout-item-info">
                    <h3>${cart[i].name}</h3>
                    <p>${cart[i].category} · Quantity: ${cart[i].quantity}</p>
                    <strong>₦${(cart[i].price * cart[i].quantity).toLocaleString()}</strong>
                </div>
            </div>
        `;

    subtotal += cart[i].price * cart[i].quantity;
  }

  total = subtotal + deliveryFee;

  checkoutSubtotal.textContent = "₦" + subtotal.toLocaleString();

  deliveryFeeDisplay.textContent =
    "₦" + deliveryFee.toLocaleString() + " (Demo)";

  checkoutTotal.textContent = "₦" + total.toLocaleString();
}

displayCheckout();

checkoutForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!currentUser) {
    checkoutMessage.textContent = "Please sign in before placing your order.";
    return;
  }

  if (cart.length === 0) {
    checkoutMessage.textContent = "Your cart is empty.";
    return;
  }

  let paymentOption = document.querySelector(
    'input[name="paymentMethod"]:checked',
  );

  if (!paymentOption) {
    checkoutMessage.textContent = "Please choose a payment method.";
    return;
  }

  let paymentMethod = paymentOption.value;

  if (paymentMethod === "online") {
    checkoutMessage.textContent =
      "Online payment is not connected yet. Please choose Pay on Delivery.";
    return;
  }

  let orderItems = [];

  for (let i = 0; i < cart.length; i++) {
    orderItems.push({
      name: cart[i].name,
      price: cart[i].price,
      category: cart[i].category,
      image: cart[i].image,
      quantity: cart[i].quantity,
    });
  }

  let orderData = {
    userId: currentUser.uid,
    customerName: document.getElementById("fullName").value,
    customerEmail: document.getElementById("email").value,
    customerPhone: document.getElementById("phone").value,
    customerState: document.getElementById("state").value,
    customerCity: document.getElementById("city").value,
    deliveryAddress: document.getElementById("address").value,

    items: orderItems,
    subtotal: subtotal,
    deliveryFee: deliveryFee,
    total: total,

    paymentMethod: paymentMethod,
    paymentStatus: "Pending",
    orderStatus: "Pending",

    createdAt: serverTimestamp(),
  };

  let placeOrderButton = checkoutForm.querySelector("button[type='submit']");

  placeOrderButton.disabled = true;
  placeOrderButton.textContent = "Placing Order...";

  addDoc(collection(db, "orders"), orderData)
    .then(function (docRef) {
      localStorage.removeItem("goldenWearsCart");

      window.location.href =
        "orderConfirmation.html?orderId=" + encodeURIComponent(docRef.id);
    })

    .catch(function (error) {
      console.log("Order error:", error);

      checkoutMessage.textContent =
        "We could not place your order. Please try again.";

      placeOrderButton.disabled = false;
      placeOrderButton.textContent = "Place Order";
    });
});
