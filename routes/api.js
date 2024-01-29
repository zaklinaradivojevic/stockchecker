'use strict';
const mongoose = require('mongoose');
const fetch = require('node-fetch');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});
// Define the stock schema
const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  likes: { type: Number, default: 0 },
  ipAddress: { type: String, required: true }
});

// Create the stock model
const Stock = mongoose.model('Stock', stockSchema);

// Save a new stock
const newStock = new Stock({ symbol: 'AAPL', price: 194.5, likes: 1, ipAddress: '0.0.0.0' });
newStock.save()
  .then((savedStock) => {
    console.log('Saved Stock:', savedStock);
  })
  .catch((error) => {
    console.error('Error saving new stock:', error);
  });

// Insert multiple stocks
const stocks = [
  { symbol: 'AAPL', price: 194.5, likes: 1, ipAddress: '0.0.0.0' },
  { symbol: 'GOOG', price: 150.35, likes: 2, ipAddress: '0.0.0.0' },
  { symbol: 'MSFT', price: 402.56, likes: 3, ipAddress: '0.0.0.0' }
];

Stock.insertMany(stocks)
  .then((savedStocks) => {
    console.log('Saved Stocks:', savedStocks);
  })
  .catch((error) => {
    console.error('Error saving stocks:', error);
  });

module.exports = function (app) {
  app.route("/api/stock-prices").get(async function (req, res) {
    const { stock: stocks, like } = req.query;

    if (!stocks) {
      res.status(400).json({ error: "Invalid request parameters" });
      return;
    }

    const symbols = Array.isArray(stocks) ? stocks : [stocks];

    if (symbols.length === 0 || symbols.length > 2) {
      res.status(400).json({ error: "Invalid number of stock symbols" });
      return;
    }

    try {
      const stockData = await Promise.all(
        symbols.map(async (symbol) => {
          const response = await fetch(
            `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`,
          );
          const result = await response.json();

          if (!response.ok) {
            console.error(
              `Failed to fetch stock price for ${symbol}. Response status: ${response.status}`,
            );
            throw new Error("API request failed");
          }

          let likes = 0;

          if (like === "true" || like === true) {
            const ip =
              req.headers["x-forwarded-for"] || req.connection.remoteAddress;
            const ipAddress = ip.split(",")[0];

            // Find the stock in the database
            let stockInDB = await Stock.findOne({ symbol });

            // If the stock doesn't exist, create it
            if (!stockInDB) {
              stockInDB = new Stock({ symbol, likes: 0, ipAddress });
            }

            // If the IP hasn't liked the stock yet, update likes and IP address
            if (stockInDB.ipAddress !== ipAddress) {
              stockInDB.likes += 1;
              stockInDB.ipAddress = ipAddress;
              await stockInDB.save();
            }

            // Update the likes variable
            likes = stockInDB.likes;
          }

          return {
            stock: result.symbol,
            price: result.latestPrice !== undefined ? result.latestPrice : 0,
            likes,
          };
        }),
      );

      console.log("stockData:", stockData);

      if (stockData.length === 2) {
        const rel_likes = stockData[0].likes - stockData[1].likes;
        stockData[0].rel_likes = rel_likes;
        stockData[1].rel_likes = -rel_likes;
      }

      // Check the length of stockData to decide on the response structure
      const responseData =
        stockData.length === 1 ? { stockData: stockData[0] } : { stockData };

      res.json(responseData);
    } catch (error) {
      console.error("Unexpected error:", error);
      res.status(500).json({ error: "Internal server error", stockData: [] });
    }
  });
};

     
};

