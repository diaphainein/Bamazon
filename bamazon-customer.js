// requires for all the important and cool things!
var inquirer = require('inquirer');
var mysql = require('mysql');
var Table = require('cli-table');

// create connection with sql db
var connection = mysql.createConnection({
    host: "localhost",
    port: 3307,
    user: "root", 
    password: "root", 
    database: "bamazon_db"
});

// super cool function that does the main process of "Bamazon" *woooo sparkles*
var bamazonCustomer = function() {
    connection.query('SELECT * FROM products', function(err, res) {
        // tell me if there's an error pls
        if (err) {
            console.log(err);
        }
        // or pls tell me I'm connected 
        console.log("connected as id " + connection.threadId);

        // creates CLI table
        var table = new Table({
            head: ['ID', 'Product Name', 'Department', 'Price', 'Stock Quantity']
        });

        // displays all items for sale 
        console.log("Hello! Here are all the items available for sale: ");
        console.log("===========================================");
        console.log(table.toString());
        for (var i = 0; i < res.length; i++) {
            table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
        }
        console.log("-----------------------------------------------");
        
        // logs table  
        console.log(table.toString());
        inquirer.prompt([{
            name: "itemId",
            type: "input",
            message: "Please tell me the ID of the item you'd like to buy.",
            validate: function(value) {
                if (isNaN(value) == false) {
                    return true;
                } else {
                    return false;
                }
            }
        }, {
            name: "Quantity",
            type: "input",
            message: "Thank you. Please tell me how many of this item you'd like to buy.",
            validate: function(value) {
                if (isNaN(value) == false) {
                    return true;
                } else {
                    return false;
                }
            }
        }]).then(function(answer) {
            var chosenId = answer.item_id - 1
            var chosenProduct = res[chosenId]
            var chosenQuantity = answer.Quantity
            if (chosenQuantity < res[chosenId].stock_quantity) {
                console.log("Your total for " + "(" + answer.Quantity + ")" + " - " + res[chosenId].ProductName + " is: " + res[chosenId].Price.toFixed(2) * chosenQuantity);
                connection.query("UPDATE products SET ? WHERE ?", [{
                    stock_quantity: res[chosenId].stock_quantity - chosenQuantity
                }, {
                    id: res[chosenId].id
                }], function(err, res) {
                    //console.log(err);
                    bamazonCustomer();
                });

            } else {
                console.log("Oops! Looks like we don't have enough of that in our inventory to complete your request. We have " + res[chosenId].StockQuantity + " left in our inventory.");
                bamazonCustomer();
            }
        });
    });
};


bamazonCustomer();