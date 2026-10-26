import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
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

let confirmationMessage = document.getElementById("confirmationMessage");
let orderDetails = document.getElementById("orderDetails");

let orderId = new URLSearchParams(window.location.search).get("orderId");

function showMoney(amount) {
  return "₦" + Number(amount || 0).toLocaleString();
}

function displayOrder(order) {
  document.getElementById("orderId").textContent = orderId;

  document.getElementById("orderStatus").textContent =
    order.orderStatus || "Pending";

  document.getElementById("confirmationSubtotal").textContent = showMoney(
    order.subtotal,
  );

  document.getElementById("confirmationDelivery").textContent = showMoney(
    order.deliveryFee,
  );

  document.getElementById("confirmationTotal").textContent = showMoney(
    order.total,
  );

  document.getElementById("customerName").textContent =
    order.customerName || "Not provided";

  document.getElementById("customerPhone").textContent =
    order.customerPhone || "Not provided";

  document.getElementById("customerAddress").textContent = [
    order.deliveryAddress,
    order.customerCity,
    order.customerState,
  ]
    .filter(Boolean)
    .join(", ");

  document.getElementById("paymentMethod").textContent =
    order.paymentMethod === "pay-on-delivery"
      ? "Pay on Delivery"
      : order.paymentMethod || "Not specified";

  let confirmationItems = document.getElementById("confirmationItems");
  confirmationItems.innerHTML = "";

  for (let i = 0; i < order.items.length; i++) {
    let item = order.items[i];

    confirmationItems.innerHTML += `
            <div class="confirmation-item">
                <img
                    src="${item.image}"
                    alt="${item.name}"
                >

                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p>Quantity: ${item.quantity}</p>
                    <p>${showMoney(item.price)} each</p>
                </div>

                <strong class="item-price">
                    ${showMoney(item.price * item.quantity)}
                </strong>
            </div>
        `;
  }

  confirmationMessage.textContent =
    "Your order has been retrieved successfully.";

  orderDetails.hidden = false;
}

onAuthStateChanged(auth, async function (user) {
  if (!user) {
    window.location.href =
      "signIn.html?returnTo=" +
      encodeURIComponent("orderConfirmation.html?orderId=" + (orderId || ""));
    return;
  }

  if (!orderId) {
    confirmationMessage.textContent =
      "No order reference was provided. Please check your orders in your account.";
    return;
  }

  try {
    let orderRef = doc(db, "orders", orderId);
    let orderSnapshot = await getDoc(orderRef);

    if (!orderSnapshot.exists()) {
      confirmationMessage.textContent =
        "We couldn't find this order. Please check your order reference.";
      return;
    }

    let order = orderSnapshot.data();

    if (order.userId !== user.uid) {
      confirmationMessage.textContent =
        "You don't have permission to view this order.";
      return;
    }

    if (!Array.isArray(order.items)) {
      confirmationMessage.textContent =
        "The order details are incomplete. Please contact support.";
      return;
    }

    displayOrder(order);
  } catch (error) {
    console.log("Error loading order:", error);

    confirmationMessage.textContent =
      "We couldn't load your order details. Please try again.";
  }
});
