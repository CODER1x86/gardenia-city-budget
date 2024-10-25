document.addEventListener("DOMContentLoaded", function () {
  const currentYear = new Date().getFullYear();
  document.getElementById("currentyear").textContent = currentYear;
  initClient();
  setupAuthListener();
  checkForLatePayments();
  loadHeaderFooter(); // Load common header and footer

  // Populate years
  const yearSelect = document.getElementById("year");
  if (yearSelect) {
    for (let year = currentYear; year >= 2024; year--) {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    }
  }

  // Load categories if on expense input page
  if (document.getElementById("category")) {
    loadCategories();
  }
});

function loadHeaderFooter() {
  fetch("header.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("header-placeholder").innerHTML = html;
    });
  fetch("footer.html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("footer-placeholder").innerHTML = html;
    });
}

function initClient() {
  gapi.load("client:auth2", () => {
    gapi.auth2
      .init({
        client_id:
          "456950986157-6menv62blh62m7sun3m63hht4ak30vn9.apps.googleusercontent.com",
        scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
      })
      .then(() => {
        if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
          loadContent();
        } else {
          gapi.auth2.getAuthInstance().signIn().then(loadContent);
        }
      })
      .catch((error) => {
        console.error("Error during Google API initialization:", error);
      });
  });
}

function setupAuthListener() {
  const loginButton = document.getElementById("login-button");
  loginButton.addEventListener("click", function () {
    gapi.auth2
      .getAuthInstance()
      .signIn()
      .then(() => {
        loadContent();
        loginButton.innerText = "Logout";
        loginButton.removeEventListener("click", setupAuthListener);
        loginButton.addEventListener("click", function () {
          gapi.auth2
            .getAuthInstance()
            .signOut()
            .then(() => {
              window.location.reload();
            });
        });
      });
  });
}
function loadContent() {
  const pathname = window.location.pathname;
  switch (pathname) {
    case "/index.html":
      // Load any specific index.html content if necessary
      break;
    case "/budget-summary.html":
      loadBudgetSummary();
      break;
    case "/expense-report.html":
      loadExpenseReport();
      break;
    case "/revenue-report.html":
      loadRevenueReport();
      break;
    case "/expense-input.html":
    case "/revenue-input.html":
      document
        .getElementById("input-form")
        .addEventListener("submit", handleFormSubmit);
      loadUnitData(); // Load unit data
      break;
  }
  handleLoginState(); // Check the login state to update menu
}

function handleLoginState() {
  const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
  const loginButton = document.getElementById("login-button");
  const dropdownContent = document.getElementById("dropdown-content");

  if (isSignedIn) {
    const user = gapi.auth2.getAuthInstance().currentUser.get();
    const profile = user.getBasicProfile();
    const firstName = profile.getGivenName();
    loginButton.innerHTML = `Hello, ${firstName}`;
    dropdownContent.innerHTML = `
      <a href="https://glitch.com/edit/#!/your-project-name">Site Settings</a>
      <a href="revenue-input.html">Revenue Input</a>
      <a href="expense-input.html">Expense Input</a>
      <a href="modify-residents.html">Modify Residents Data</a>
      <a href="#" id="logout-button"><i class="material-icons left">logout</i>Logout</a>
    `;
    loginButton.addEventListener("click", function () {
      dropdownContent.classList.toggle("show");
    });
    document
      .getElementById("logout-button")
      .addEventListener("click", function () {
        gapi.auth2
          .getAuthInstance()
          .signOut()
          .then(() => {
            window.location.reload();
          });
      });
  } else {
    loginButton.innerHTML = `<i class="material-icons left">login</i>Login`;
    loginButton.addEventListener("click", function () {
      gapi.auth2.getAuthInstance().signIn();
    });
  }
}
function loadUnitData() {
  const unitNumberSelect = document.getElementById("unit-number");
  const floorField = document.getElementById("floor");
  const ownerNameField = document.getElementById("owner-name");
  const tenantNameField = document.getElementById("tenant-name");
  const spreadsheetId = "1oXgh1ZQJvlcvXsx8Gv-8lVEJEln51UWDCmEsq7f7aj4"; // Replace with your actual spreadsheet ID
  const range = "Revenue!A2:AR"; // Adjust the range according to your sheet structure
  gapi.client.sheets.spreadsheets.values
    .get({
      spreadsheetId: spreadsheetId,
      range: range,
    })
    .then((response) => {
      const unitData = response.result.values.reduce(
        (
          acc,
          [
            unit,
            floor,
            owner,
            ownerPhone,
            tenant,
            tenantPhone,
            lastPaymentMonth,
            lastPaymentDate,
            ...rest
          ]
        ) => {
          acc[unit] = {
            floor,
            owner,
            ownerPhone,
            tenant,
            tenantPhone,
            lastPaymentMonth,
            lastPaymentDate,
          };
          return acc;
        },
        {}
      );
      unitNumberSelect.addEventListener("change", function () {
        const selectedUnit = this.value;
        if (unitData[selectedUnit]) {
          floorField.textContent = unitData[selectedUnit].floor;
          ownerNameField.textContent = unitData[selectedUnit].owner;
          tenantNameField.textContent = unitData[selectedUnit].tenant || "";
          document.getElementById("owner-phone").textContent =
            unitData[selectedUnit].ownerPhone;
          document.getElementById("tenant-phone").textContent =
            unitData[selectedUnit].tenantPhone || "";
          document.getElementById("last-payment-month").textContent =
            unitData[selectedUnit].lastPaymentMonth;
          document.getElementById("last-payment-date").textContent =
            unitData[selectedUnit].lastPaymentDate;
          document.getElementById("unit-details").style.display = "block";
        } else {
          document.getElementById("unit-details").style.display = "none";
        }
      });
    })
    .catch((error) => {
      console.error("Error loading unit data from Google Sheets:", error);
    });
}

function loadCategories() {
  const spreadsheetId = "1oXgh1ZQJvlcvXsx8Gv-8lVEJEln51UWDCmEsq7f7aj4";
  const range = "Categories!A1:A"; // Adjust the range based on your sheet structure
  gapi.client.sheets.spreadsheets.values
    .get({
      spreadsheetId: spreadsheetId,
      range: range,
    })
    .then((response) => {
      const categories = response.result.values;
      const categorySelect = document.getElementById("category");
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category[0];
        option.textContent = category[0];
        categorySelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error loading categories from Google Sheets:", error);
    });
}

document
  .getElementById("input-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const data = Array.from(new FormData(this)).map(([key, value]) => value);
    saveData(data);
  });

function saveData(data) {
  const pathname = window.location.pathname;
  let range;
  if (pathname === "/expense-input.html") {
    range = "Expenses!A:E";
  } else if (pathname === "/revenue-input.html") {
    range = "Revenue!A:AR";
  }
  const spreadsheetId = "1oXgh1ZQJvlcvXsx8Gv-8lVEJEln51UWDCmEsq7f7aj4";
  gapi.client.sheets.spreadsheets.values
    .append({
      spreadsheetId: spreadsheetId,
      range: range,
      valueInputOption: "USER_ENTERED",
      resource: { values: [data] },
    })
    .then((response) => {
      alert("Data saved successfully!");
      document.getElementById("input-form").reset();
      document.getElementById("add-new-revenue").style.display = "block";
      document.getElementById("add-new-expense").style.display = "block";
    })
    .catch((error) => {
      console.error("Error saving data: ", error);
      alert("Failed to save data.");
    });
}

document
  .getElementById("add-new-revenue")
  .addEventListener("click", function () {
    document.getElementById("input-form").reset();
    this.style.display = "none";
  });
document
  .getElementById("add-new-expense")
  .addEventListener("click", function () {
    document.getElementById("input-form").reset();
    this.style.display = "none";
  });
