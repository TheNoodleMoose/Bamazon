const mysql = require("mysql");
const Table = require("cli-table");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3307,
  user: "root",
  password: "root",
  database: "bamazon_db"
});

connection.connect(err => {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
});

var table = new Table({
  head: ["ITEM ID", "PRODUCT NAME", "DEPARTMENT", "PRICE", "STOCK QUANTITY"],
  colWidths: [15, 25, 15, 15, 15]
});

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
});
