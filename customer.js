const mysql = require("mysql");
const Table = require("cli-table");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3307,
  user: "root",
  password: "root",
  database: "bamazon_db"
});

connection.connect(err => {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
});

var table = new Table({
  head: ["ITEM ID", "PRODUCT NAME", "DEPARTMENT", "PRICE", "STOCK QUANTITY"],
  colWidths: [15, 25, 15, 15, 15]
});

function buyProduct(amount, product_id) {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the amount you wish to purchase?",
        name: "amount"
      }
    ])
    .then(res => {
      if (amount > res.amount) {
        console.log("You Can Buy This!");
        console.log("Updated Amount!");
        updateProduct(res.amount, product_id, amount);
      } else {
        console.log("Insufficent Quantity!");
        buyProduct(amount, product_id);
      }
    });
}

function chooseProduct(product) {
  connection.query(
    "SELECT * FROM products WHERE item_id = ?",
    [product],
    (err, res) => {
      let quantity;
      for (let i in res) {
        quantity = res[i].stock_quantity;
        product_id = res[i].item_id;
      }
      console.log(product_id);
      console.log(quantity);
      buyProduct(quantity, product_id);
    }
  );
}

function updateProduct(amount, item, product_stock) {
  connection.query("UPDATE products SET ? WHERE ?", [
    {
      stock_quantity: product_stock - amount
    },
    {
      item_id: item
    }
  ]),
    askAgain();
}
function promptCustomer() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What Is The Item ID of the product you wish to buy?",
        name: "choice"
      }
    ])
    .then(res => {
      chooseProduct(res.choice);
    });
}

function askAgain() {
  inquirer
    .prompt([
      {
        type: "confirm",
        message: "Do You Want To Buy Something Else?",
        name: "choice"
      }
    ])
    .then(res => {
      if (res.choice) {
        grabProducts();
      } else {
        console.log("Thanks For Shopping At Bamazon!");
      }
    });
}

function grabProducts() {
  table.length = 0;
  connection.query("SELECT * FROM products", (err, res) => {
    if (err) throw err;

    for (let i in res) {
      let item_id = res[i].item_id;
      let product_name = res[i].product_name;
      let department_name = res[i].department_name;
      let price = res[i].price;
      let stock = res[i].stock_quantity;

      table.push([item_id, product_name, department_name, price, stock]);
    }
    console.log(table.toString());
    promptCustomer();
  });
}
grabProducts();
