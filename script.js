/* ===== INITIAL SETUP ===== */
if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify({}));
}

let currentUser = null;
let generatedOTP = null;

/* ===== REGISTER ===== */
function register() {
    let user = regUser.value;
    let pass = regPass.value;

    if (!user || !pass || !regIFSC.value) {
        msg.innerText = "All fields are required";
        return;
    }

    let users = JSON.parse(localStorage.getItem("users"));

    if (users[user]) {
        msg.innerText = "User already exists";
        return;
    }

    users[user] = {
        password: pass,
        balance: 0,
        account: "AC" + Math.floor(100000 + Math.random() * 900000),
        ifsc: regIFSC.value,
        history: []
    };

    localStorage.setItem("users", JSON.stringify(users));
    alert("Registration successful! Please login.");
    window.location.href = "index.html";
}

/* ===== LOGIN ===== */
function login() {
    let user = username.value;
    let pass = password.value;

    let users = JSON.parse(localStorage.getItem("users"));

    if (!users[user]) {
        msg.innerText = "User not registered. Register first.";
        return;
    }

    if (users[user].password === pass) {
        localStorage.setItem("currentUser", user);
        window.location.href = "addbalance.html";
    } else {
        msg.innerText = "Incorrect password";
    }
}

/* ===== DASHBOARD LOAD ===== */
if (localStorage.getItem("currentUser")) {
    currentUser = localStorage.getItem("currentUser");
    let users = JSON.parse(localStorage.getItem("users"));
    let u = users[currentUser];

    if (welcome) {
        welcome.innerText = "Welcome, " + currentUser;
        acc.innerText = "Account No: " + u.account;
        ifsc.innerText = "IFSC Code: " + u.ifsc;
        checkBalance();
        loadHistory();
    }
}

/* ===== ADDBALANCE LOAD ===== */
if (window.location.pathname.includes("addbalance.html") && localStorage.getItem("currentUser")) {
    currentUser = localStorage.getItem("currentUser");
    let users = JSON.parse(localStorage.getItem("users"));
    let u = users[currentUser];

    if (welcome) {
        welcome.innerText = "Welcome, " + currentUser;
        acc.innerText = "Account No: " + u.account;
        ifsc.innerText = "IFSC Code: " + u.ifsc;
        checkBalance();
    }
}

/* ===== BALANCE ===== */
function checkBalance() {
    let users = JSON.parse(localStorage.getItem("users"));
    balance.innerText = "Balance: ₹" + users[currentUser].balance;
    loadHistory();
}

/* ===== OTP TRANSFER ===== */
function sendOTP() {
    if (recipientAccount.style.display === "none") {
        // First click: show recipient fields
        let amt = Number(amount.value);
        if (amt <= 0) {
            alert("Enter a valid amount first");
            return;
        }
        recipientAccount.style.display = "block";
        recipientIFSC.style.display = "block";
        transferBtn.innerText = "Send OTP";
    } else {
        // Second click: proceed with transfer
        let recipientAcc = recipientAccount.value;
        let recipientIfsc = recipientIFSC.value;
        let amt = Number(amount.value);

        if (!recipientAcc || !recipientIfsc || amt <= 0) {
            alert("All fields are required and amount must be positive");
            return;
        }

        let users = JSON.parse(localStorage.getItem("users"));
        let recipient = Object.keys(users).find(u => users[u].account === recipientAcc);

        if (!recipient) {
            // Create new user if account not found
            users[recipientAcc] = {
                password: '',
                balance: 0,
                account: recipientAcc,
                ifsc: recipientIfsc,
                history: []
            };
            recipient = recipientAcc;
        } else if (users[recipient].ifsc !== recipientIfsc) {
            alert(`IFSC code does not match. The correct IFSC is: ${users[recipient].ifsc}`);
            return;
        }

        // Show confirmation
        let confirmMsg = `Confirm Transfer:\nAmount: ₹${amt}\nTo: ${recipient} (Account: ${recipientAcc}, IFSC: ${recipientIfsc})\n\nProceed?`;
        if (!confirm(confirmMsg)) {
            return;
        }

        generatedOTP = Math.floor(1000 + Math.random() * 9000);
        alert("OTP (Demo): " + generatedOTP);

        let entered = prompt("Enter OTP");
        verifyOTP(entered, amt, recipient);
    }
}

function verifyOTP(otp, amt, recipient) {
    let users = JSON.parse(localStorage.getItem("users"));

    if (otp == generatedOTP && amt <= users[currentUser].balance) {
        users[currentUser].balance -= amt;
        users[recipient].balance += amt;
        users[currentUser].history.push(
            `₹${amt} transferred to ${recipient} on ${new Date().toLocaleString()}`
        );
        users[recipient].history.push(
            `₹${amt} received from ${currentUser} on ${new Date().toLocaleString()}`
        );
        localStorage.setItem("users", JSON.stringify(users));
        alert("Transfer successful");

        // Reset form
        amount.value = "";
        recipientAccount.value = "";
        recipientIFSC.value = "";
        recipientAccount.style.display = "none";
        recipientIFSC.style.display = "none";
        transferBtn.innerText = "Transfer Money";
        transferBtn.onclick = sendOTP;

        checkBalance();
        loadHistory();
    } else {
        alert("OTP invalid or insufficient balance");
    }
}

/* ===== HISTORY ===== */
function loadHistory() {
    let users = JSON.parse(localStorage.getItem("users"));
    history.innerHTML = "";
    users[currentUser].history.forEach(h => {
        let li = document.createElement("li");
        li.innerText = h;
        history.appendChild(li);
    });
}

/* ===== DARK MODE ===== */
function toggleMode() {
    document.body.classList.toggle("dark");
}

/* ===== ADD BALANCE ===== */
function addBalance() {
    let amt = Number(addAmount.value);
    if (amt <= 0) return alert("Enter valid amount");

    let users = JSON.parse(localStorage.getItem("users"));
    users[currentUser].balance += amt;
    users[currentUser].history.push(
        `₹${amt} added on ${new Date().toLocaleString()}`
    );
    localStorage.setItem("users", JSON.stringify(users));
    alert("Balance added successfully");
    checkBalance();
}

/* ===== GO TO DASHBOARD ===== */
function goToDashboard() {
    window.location.href = "dashboard.html";
}

/* ===== LOGOUT ===== */
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}
