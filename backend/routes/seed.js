const express = require("express");
const axios = require("axios");
const Item = require("../models/Item");

const router = express.Router();

const getMonthNumber = (monthName) => {
  const months = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };
  return months[monthName];
};

function validateMonthInput(monthInput) {
  if (!monthInput) {
    return { isValid: false, message: "Month is required" };
  }

  let monthNumber = isNaN(monthInput)
    ? getMonthNumber(monthInput)
    : parseInt(monthInput);

  if (!monthNumber || monthNumber < 1 || monthNumber > 12) {
    return { isValid: false, message: "Invalid month" };
  }

  return { isValid: true, monthNumber };
}

router.post("/seed", async (req, res) => {
  try {
    const response = await axios.get(process.env.THIRD_PARTY_API);
    const data = response.data;

    const items = data.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      price: item.price,
      description: item.description,
      sold: item.sold,
      dateOfSale: item.dateOfSale,
    }));

    await Item.deleteMany({});

    await Item.insertMany(items);

    res.status(200).json({ message: "Database seeded successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error seeding the database", error: err });
  }
});

router.get("/items", async (req, res) => {
  try {
    let monthInput = req.query.month;
    if (!monthInput) {
      return res.status(400).json({ message: "Month is required" });
    }

    let monthNumber = isNaN(monthInput)
      ? getMonthNumber(monthInput)
      : parseInt(monthInput);

    if (!monthNumber || monthNumber < 1 || monthNumber > 12) {
      return res.status(400).json({ message: "Invalid month" });
    }

    let items = await Item.find({
      $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
    });

    res.status(200).json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching data", error: err });
  }
});

router.get("/items/total", async (req, res) => {
  try {
    let monthInput = req.query.month;
    if (!monthInput) {
      return res.status(400).json({ message: "Month is required" });
    }

    let monthNumber = isNaN(monthInput)
      ? getMonthNumber(monthInput)
      : parseInt(monthInput);

    if (!monthNumber || monthNumber < 1 || monthNumber > 12) {
      return res.status(400).json({ message: "Invalid month" });
    }

    let transactions = await Item.find({
      $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
    });

    let totalSaleAmount = 0;
    let totalSoldItems = 0;
    let totalNotSoldItems = 0;
    let totalItems = 0;

    transactions.forEach((Item) => {
      if (Item.sold) {
        totalSaleAmount += Item.price;
        totalSoldItems++;
      } else {
        totalNotSoldItems++;
      }
      totalItems++;
    });

    res.status(200).json({
      totalSaleAmount,
      totalSoldItems,
      totalNotSoldItems,
      totalItems,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching data", error: err });
  }
});

router.get("/transactions", async (req, res) => {
  try {
    const { month, search = "", page = 1, perPage = 10 } = req.query;

    const { isValid, monthNumber, message } = validateMonthInput(month);
    if (!isValid) {
      return res.status(400).json({ message });
    }

    const filter = {
      $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { price: parseFloat(search) || 0 },
      ];
    }

    const transactions = await Item.find(filter)
      .skip((page - 1) * perPage)
      .limit(perPage);
    const totalCount = await Item.countDocuments(filter);

    res.status(200).json({
      transactions,
      totalPages: Math.ceil(totalCount / perPage),
      currentPage: page,
      totalRecords: totalCount,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching transactions", error: err });
  }
});

router.get("/items/price-range", async (req, res) => {
  try {
    let monthInput = req.query.month;
    const { isValid, monthNumber, message } = validateMonthInput(monthInput);

    if (!isValid) {
      return res.status(400).json({ message });
    }

    let items = await Item.find({
      $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
    });

    let priceRanges = {
      "0-100": 0,
      "101-200": 0,
      "201-300": 0,
      "301-400": 0,
      "401-500": 0,
      "501-600": 0,
      "601-700": 0,
      "701-800": 0,
      "801-900": 0,
      "901-above": 0,
    };

    items.forEach((item) => {
      const price = item.price;

      if (price <= 100) {
        priceRanges["0-100"]++;
      } else if (price <= 200) {
        priceRanges["101-200"]++;
      } else if (price <= 300) {
        priceRanges["201-300"]++;
      } else if (price <= 400) {
        priceRanges["301-400"]++;
      } else if (price <= 500) {
        priceRanges["401-500"]++;
      } else if (price <= 600) {
        priceRanges["501-600"]++;
      } else if (price <= 700) {
        priceRanges["601-700"]++;
      } else if (price <= 800) {
        priceRanges["701-800"]++;
      } else if (price <= 900) {
        priceRanges["801-900"]++;
      } else {
        priceRanges["901-above"]++;
      }
    });

    res.status(200).json(priceRanges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching data", error: err });
  }
});

router.get("/items/category", async (req, res) => {
  try {
    let monthInput = req.query.month;
    const { isValid, monthNumber, message } = validateMonthInput(monthInput);

    if (!isValid) {
      return res.status(400).json({ message });
    }

    let items = await Item.find({
      $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
    });

    const categoryCounts = {};

    items.forEach((item) => {
      const category = item.category || "Unknown";

      if (categoryCounts[category]) {
        categoryCounts[category]++;
      } else {
        categoryCounts[category] = 1;
      }
    });
    const categoryDistribution = Object.entries(categoryCounts).map(
      ([category, count]) => ({
        category,
        count,
      })
    );
    res.status(200).json(categoryDistribution);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching transactions", error: err });
  }
});

router.get("/items/combined", async (req, res) => {
  try {
    let monthInput = req.query.month;

    const { isValid, monthNumber, message } = validateMonthInput(monthInput);

    if (!isValid) {
      return res.status(400).json({ message });
    }

    const apiUrl = "http://localhost:3000/api";

    const [sumResponse, priceRangeResponse, categoryDistributionResponse] =
      await Promise.all([
        axios.get(`${apiUrl}/items/total`, { params: { month: monthNumber } }),
        axios.get(`${apiUrl}/items/price-range`, {
          params: { month: monthNumber },
        }),
        axios.get(`${apiUrl}/items/category`, {
          params: { month: monthNumber },
        }),
      ]);

    const combinedData = {
      salesSummary: sumResponse.data,
      priceRangeDistribution: priceRangeResponse.data,
      categoryDistribution: categoryDistributionResponse.data,
    };

    res.status(200).json(combinedData);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching combined data", error: err });
  }
});
module.exports = router;
