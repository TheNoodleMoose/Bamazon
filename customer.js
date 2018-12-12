const mysql = require("mysql");
const { table } = require("table");

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

connection.query("SELECT * FROM products", (err, res) => {
  if (err) throw err;
  console.log(res);
  let data;
  let output;

  function Row(name, department, price, quantity) {
    this.name = name;
    this.department = department;
    this.price = price;
    this.quantity = quantity;
  }

  let rows = [];

  for (let i in res) {
    let data = new Row(
      res[i].product_name,
      res[i].department_name,
      res[i].price,
      res[i].stock_quantity
    );
    rows.push(data);
  }

  console.table([rows[0]]);
});
