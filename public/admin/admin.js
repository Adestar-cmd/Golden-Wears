
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
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
const auth = getAuth(app);
const db = getFirestore(app);


document.body.style.visibility = "hidden";

const totalProducts = document.getElementById("totalProducts");
const totalOrders = document.getElementById("totalOrders");
const pendingOrders = document.getElementById("pendingOrders");
const totalRevenue = document.getElementById("totalRevenue");

const recentOrders = document.getElementById("recentOrders");
const allOrders = document.getElementById("allOrders");
const productsTable = document.getElementById("productsTable");


const productForm = document.getElementById("productForm");
const productFormCard = document.getElementById("productFormCard");
const productFormTitle = document.getElementById("productFormTitle");

const showProductForm = document.getElementById("showProductForm");
const closeProductForm = document.getElementById("closeProductForm");

const productName = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
const productCategory = document.getElementById("productCategory");
const productStock = document.getElementById("productStock");
const productImage = document.getElementById("productImage");
const productDescription = document.getElementById("productDescription");

let editingProductId = null;
let messageTimer;


function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];
    });
}


function showMessage(message, type = "success") {
    const toast = document.getElementById("adminToast");

    if (!toast) {
        console.log(message);
        return;
    }

    clearTimeout(messageTimer);

    toast.textContent = message;
    toast.className = "admin-toast " + type + " show";

    messageTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 3000);
}


onAuthStateChanged(auth, async function (user) {
    if (!user) {
        window.location.replace(
            "../client/signIn.html?returnTo=../admin/index.html"
        );
        return;
    }

    try {
        const adminRef = doc(db, "Admins", user.uid);
        const adminSnapshot = await getDoc(adminRef);

        if (
            !adminSnapshot.exists() ||
            adminSnapshot.data().role !== "admin"
        ) {
            window.location.replace("../client/dashboard.html");
            return;
        }

        document.body.style.visibility = "visible";

        await loadProducts();
        await loadDashboard();

    } catch (error) {
        console.log("Admin verification or loading error:", error);

        document.body.style.visibility = "visible";

        showMessage(
            "Unable to verify admin access or load data. Check your Firestore rules.",
            "error"
        );
    }
});

// Open the product form.
showProductForm.addEventListener("click", function () {
    productForm.reset();
    editingProductId = null;

    productFormTitle.textContent = "Add New Product";
    productFormCard.classList.remove("hidden-section");
});


closeProductForm.addEventListener("click", function () {
    productFormCard.classList.add("hidden-section");
    productForm.reset();

    editingProductId = null;
    productFormTitle.textContent = "Add New Product";
});


productForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = productName.value.trim();
    const price = Number(productPrice.value);
    const category = productCategory.value;
    const stock = Number(productStock.value);
    const image = productImage.value.trim();
    const description = productDescription.value.trim();


    if (
        name === "" ||
        !Number.isFinite(price) ||
        price <= 0 ||
        category === "" ||
        !Number.isInteger(stock) ||
        stock < 0 ||
        image === "" ||
        description === ""
    ) {
        showMessage("Please complete all fields correctly.", "error");
        return;
    }

    const saveButton = productForm.querySelector('button[type="submit"]');

    saveButton.disabled = true;
    saveButton.textContent = "Saving...";

    const productData = {
        name: name,
        price: price,
        category: category,
        stock: stock,
        image: image,
        description: description,
        updatedAt: serverTimestamp()
    };

    try {
        if (editingProductId) {
            await updateDoc(
                doc(db, "products", editingProductId),
                productData
            );

            showMessage("Product updated successfully!");

        } else {
            productData.createdAt = serverTimestamp();

            await addDoc(collection(db, "products"), productData);

            showMessage("Product added successfully!");
        }

        productForm.reset();
        productFormCard.classList.add("hidden-section");

        editingProductId = null;
        productFormTitle.textContent = "Add New Product";

        await loadProducts();

    } catch (error) {
        console.log("Product save error:", error);

        showMessage(
            "Unable to save product. Please try again.",
            "error"
        );

    } finally {
        saveButton.disabled = false;
        saveButton.textContent = "Save Product";
    }
});


async function loadProducts() {
    try {
        const productSnapshot = await getDocs(collection(db, "products"));
        const products = [];

        productSnapshot.forEach(function (productDocument) {
            products.push({
                id: productDocument.id,
                ...productDocument.data()
            });
        });

        totalProducts.textContent = products.length;
        productsTable.innerHTML = "";

        if (products.length === 0) {
            productsTable.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        No products yet. Click Add Product to get started.
                    </td>
                </tr>
            `;

            return;
        }

        for (let i = 0; i < products.length; i++) {
            const product = products[i];

            productsTable.innerHTML += `
                <tr>
                    <td>${escapeHTML(product.name)}</td>
                    <td>${escapeHTML(product.category)}</td>
                    <td>₦${Number(product.price || 0).toLocaleString()}</td>
                    <td>${Number(product.stock || 0)}</td>
                    <td>
                        <button
                            type="button"
                            class="product-action-btn product-edit-btn"
                            data-action="edit"
                            data-id="${escapeHTML(product.id)}">
                            Edit
                        </button>

                        <button
                            type="button"
                            class="product-action-btn product-delete-btn"
                            data-action="delete"
                            data-id="${escapeHTML(product.id)}">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        }

    } catch (error) {
        console.log("Loading products error:", error);

        productsTable.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    Unable to load products.
                </td>
            </tr>
        `;

        throw error;
    }
}


productsTable.addEventListener("click", async function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const productId = button.dataset.id;
    const action = button.dataset.action;

    if (action === "edit") {
        try {
            const productSnapshot = await getDoc(
                doc(db, "products", productId)
            );

            if (!productSnapshot.exists()) {
                showMessage("This product could not be found.", "error");
                return;
            }

            const product = productSnapshot.data();

            editingProductId = productId;

            productName.value = product.name || "";
            productPrice.value = product.price ?? "";
            productCategory.value = product.category || "";
            productStock.value = product.stock ?? 0;
            productImage.value = product.image || "";
            productDescription.value = product.description || "";

            productFormTitle.textContent = "Edit Product";
            productFormCard.classList.remove("hidden-section");

            productFormCard.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        } catch (error) {
            console.log("Loading product for editing failed:", error);

            showMessage(
                "Unable to open this product for editing.",
                "error"
            );
        }
    }

    if (action === "delete") {
        const confirmed = confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) {
            return;
        }

        button.disabled = true;

        try {
            await deleteDoc(doc(db, "products", productId));

            showMessage("Product deleted successfully!");

            await loadProducts();

        } catch (error) {
            console.log("Product deletion error:", error);

            showMessage(
                "Unable to delete this product. Please try again.",
                "error"
            );

            button.disabled = false;
        }
    }
});


async function loadDashboard() {
    try {
        const orderSnapshot = await getDocs(collection(db, "orders"));
        const orders = [];

        orderSnapshot.forEach(function (orderDocument) {
            orders.push({
                id: orderDocument.id,
                ...orderDocument.data()
            });
        });

        totalOrders.textContent = orders.length;

        let pendingCount = 0;
        let revenue = 0;

        for (let i = 0; i < orders.length; i++) {
            if (orders[i].orderStatus === "Pending") {
                pendingCount++;
            }

            if (orders[i].paymentStatus === "Paid") {
                revenue += Number(orders[i].total || 0);
            }
        }

        pendingOrders.textContent = pendingCount;
        totalRevenue.textContent = "₦" + revenue.toLocaleString();

        recentOrders.innerHTML = "";
        allOrders.innerHTML = "";

        if (orders.length === 0) {
            recentOrders.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        No orders found.
                    </td>
                </tr>
            `;

            allOrders.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        No orders found.
                    </td>
                </tr>
            `;

            return;
        }


        orders.sort(function (a, b) {
            const dateA = a.createdAt ? a.createdAt.toMillis() : 0;
            const dateB = b.createdAt ? b.createdAt.toMillis() : 0;

            return dateB - dateA;
        });

        const orderStatuses = [
            "Pending",
            "Processing",
            "Shipped",
            "Out for Delivery",
            "Delivered",
            "Cancelled"
        ];

        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];

            let orderDate = "N/A";

            if (order.createdAt) {
                orderDate = order.createdAt
                    .toDate()
                    .toLocaleDateString("en-NG");
            }

            const currentStatus = orderStatuses.includes(order.orderStatus)
                ? order.orderStatus
                : "Pending";

            recentOrders.innerHTML += `
                <tr>
                    <td>${escapeHTML(order.id.slice(0, 8))}</td>
                    <td>${escapeHTML(order.customerName || "Customer")}</td>
                    <td>${escapeHTML(orderDate)}</td>
                    <td>₦${Number(order.total || 0).toLocaleString()}</td>
                    <td>${escapeHTML(currentStatus)}</td>
                </tr>
            `;

            const statusOptions = orderStatuses.map(function (status) {
                return `
                    <option value="${status}"
                        ${status === currentStatus ? "selected" : ""}>
                        ${status}
                    </option>
                `;
            }).join("");

            allOrders.innerHTML += `
                <tr>
                    <td>${escapeHTML(order.id.slice(0, 8))}</td>
                    <td>${escapeHTML(order.customerName || "Customer")}</td>
                    <td>${escapeHTML(order.customerPhone || "N/A")}</td>
                    <td>₦${Number(order.total || 0).toLocaleString()}</td>
                    <td>${escapeHTML(order.paymentMethod || "N/A")}</td>
                    <td>${escapeHTML(currentStatus)}</td>
                    <td>
                        <select
                            class="order-status-select"
                            data-order-id="${escapeHTML(order.id)}"
                            aria-label="Update order status">
                            ${statusOptions}
                        </select>
                    </td>
                </tr>
            `;
        }

    } catch (error) {
        console.log("Dashboard loading error:", error);

        showMessage("Unable to load dashboard data.", "error");

        throw error;
    }
}


allOrders.addEventListener("change", async function (event) {
    if (!event.target.classList.contains("order-status-select")) {
        return;
    }

    const selectedStatus = event.target.value;
    const orderId = event.target.dataset.orderId;

    event.target.disabled = true;

    try {
        await updateDoc(doc(db, "orders", orderId), {
            orderStatus: selectedStatus
        });

        showMessage("Order status updated successfully!");

        await loadDashboard();

    } catch (error) {
        console.log("Order status update error:", error);

        showMessage(
            "Unable to update order status. Check your Firestore rules.",
            "error"
        );

        await loadDashboard();
    }
});


const adminLinks = document.querySelectorAll("[data-section]");
const adminSections = document.querySelectorAll(".admin-section");

adminLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
        event.preventDefault();

        const sectionId = link.dataset.section;

        adminSections.forEach(function (section) {
            section.classList.toggle(
                "hidden-section",
                section.id !== sectionId
            );
        });

        document.querySelectorAll(".admin-link").forEach(function (item) {
            item.classList.toggle(
                "active",
                item.dataset.section === sectionId
            );
        });

        window.location.hash = sectionId;
    });
});


document.getElementById("logoutBtn").addEventListener("click", async function () {
    try {
        await signOut(auth);
        window.location.replace("../client/signIn.html");
    } catch (error) {
        console.log("Logout error:", error);
        showMessage("Unable to log out. Please try again.", "error");
    }
});
