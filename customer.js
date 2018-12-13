// The Whole function is ran inside of a anonymous self calling function,
// This means there are no global variables
(function() {
  //Require mysql
  const mysql = require("mysql");
  //Require cli-table
  const Table = require("cli-table");
  //Require inquirer
  const inquirer = require("inquirer");
  //Keeps Track Of How Much The User Spent
  let grandTotal = 0;

  //This establishes our connection to our database using mysql npm
  const connection = mysql.createConnection({
    host: "localhost",
    port: 3307,
    user: "root",
    password: "root",
    database: "bamazon_db"
  });
  //When we connect to the database, console log the connection threadId
  connection.connect(err => {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
  });
  //This creates a new table for our information to be stored in
  var table = new Table({
    head: ["ITEM ID", "PRODUCT NAME", "DEPARTMENT", "PRICE", "STOCK QUANTITY"],
    colWidths: [15, 25, 15, 15, 17]
  });

  //This it what "buys" the product. It prompts the user to enter how much of the product
  //they want to buy, and checks to see if their chosen amount if less than the stock quantity.
  //If it is less than, it will then run updateProduct. If the amount is greater than the stock
  //quantity than it let the user know that the amount is too much and prompt them to enter a
  // different amount

  function buyProduct(amount, product_id, price) {
    inquirer
      .prompt([
        {
          type: "input",
          message: "What is the amount you wish to purchase?",
          name: "amount",
          validate: value => {
            let valid = !isNaN(parseFloat(value));
            return valid || "Please Enter A Number";
          }
        }
      ])
      .then(res => {
        if (amount > res.amount) {
          console.log("You Can Buy This!");
          console.log("Updated Amount!");
          totalSpent(res.amount, price);
          updateProduct(res.amount, product_id, amount);
        } else {
          console.log("Insufficent Quantity!");
          buyProduct(amount, product_id, price);
        }
      });
  }

  // This is how we choose the product the user wants to buy. It takes in the argument product,
  //which is passed from the promptUser function. Product is the item_ID number and we search that
  //Item_id and grab the whole object. From that item the user chose we grab out the quantity
  //and it's ID number. We then run buyProduct with those values.
  function chooseProduct(product) {
    connection.query(
      "SELECT * FROM products WHERE item_id = ?",
      [product],
      (err, res) => {
        let quantity;
        for (let i in res) {
          quantity = res[i].stock_quantity;
          product_id = res[i].item_id;
          price = res[i].price;
        }
        buyProduct(quantity, product_id, price);
      }
    );
  }
  // Keeps track of how much the user spent
  function totalSpent(amount, price) {
    grandTotal += amount * price;
  }

  // This is actually what updates the stock quantity total in the database,
  // it then runs askAgain to see if the user wants to buy more items.
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
  // This is how we find out what item the user wants to buy, and then runs chooseProduct
  function promptCustomer() {
    inquirer
      .prompt([
        {
          type: "input",
          message: "What Is The Item ID of the product you wish to buy?",
          name: "choice",
          validate: value => {
            let valid = !isNaN(parseFloat(value));
            return valid || "Please Enter A Number";
          }
        }
      ])
      .then(res => {
        chooseProduct(res.choice);
      });
  }

  //This asks the user if they want to buy another item. If They do we run grabProducts again,
  //If not we end the connection.
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
          console.log(`Your Grand Total: $${grandTotal}`);
          connection.end();
        }
      });
  }
  //This is what starts the whole process. It empties the table and then makes a query to the
  //database to grab all the data from products. For each what we store each value into its own
  // variable and then push those values to the Table. We then console log the table and run
  //promptCustomer
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
  //This is what starts the whole thing
  grabProducts();
})();
