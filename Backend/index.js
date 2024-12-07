const express = require('express');
const { default: mongoose } = require('mongoose');
const transactionSchema = require('./TransactionSchema');
const axios = require('axios')
require('dotenv').config()
const app = express()
const cors = require('cors')

app.use(cors());
const port = process.env.PORT

mongoose.connect(process.env.MONGODB_URI)
.then(()=>console.log("MongoDB Connected Successfully"))
.catch((error)=>console.log(error));

app.get('/initialize-db',async(req,res)=>{
    try{
        const response = await axios.get(' https://s3.amazonaws.com/roxiler.com/product_transaction.json')
        const productData = response.data

        const existingData = await transactionSchema.countDocuments()
        if(existingData > 0){
            res.status(400).json({
                message: 'Data already exists'
            })
            return
        }

        await transactionSchema.insertMany(productData)
        res.status(200).json({
            message:"Data Seeded Successfully"
        })

    }catch(error){
        res.status(500).json({
            message:"Data Not Initialized",
            error: error.message
        })
    }
})


app.get('/transactions',async(req,res)=>{
    const{search = '' , page = 1 , perPage = 10} = req.query

    try{
        const pageNum = parseInt(page);
        const perPageNum = parseInt(perPage);

        const searchRegex = new RegExp(search,'i');
        const filter = {
            $or:[
                {title : {$regex : searchRegex}},
                {description : {$regex : searchRegex}},
            ]
        }

        if (!isNaN(parseFloat(search))) {
            filter.$or.push({ price: parseFloat(search) });
        }

        const totalRecords = await transactionSchema.countDocuments(filter)

        const transactions = await transactionSchema.find(filter)
        .skip((pageNum - 1) * perPageNum)
        .limit(perPageNum)
        .exec();

        res.status(200).json({
            page: pageNum,
            perPage: perPageNum,
            totalRecords,
            totalPages: Math.ceil(totalRecords / perPageNum),
            transactions,
        });
    }catch(err){
        res.status(500).json({
            message:'Error Fetching Transactions',
            error:err.message
        })
    }
})

app.get('/statistics',async(req,res)=>{
    const {month} = req.query

    if (!month || !['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].includes(month)) {
        return res.status(400).json({ message: 'Invalid month input. Please provide a valid month (January to December).' 
        });
    }

    try{
        const monthNumber = new Date(Date.parse(month +' 1, 2024')).getMonth();

        const stats = await transactionSchema.aggregate([
            {
                $match: {
                    $expr : {
                        $eq : [{$month : '$dateOfSale'},
                    monthNumber + 1]
                    }
                }
            },
            {
                $group : {
                    _id: null,
                    totalSales: { $sum: { $cond: [{ $eq: ["$sold", true] }, "$price", 0] } }, 
                    soldItems: { $sum: { $cond: [{ $eq: ["$sold", true] }, 1, 0] } }, 
                    unsoldItems: { $sum: { $cond: [{ $eq: ["$sold", false] }, 1, 0] } },
                },
            },
        ]);

        if (stats.length === 0) {
            return res.status(200).json({ message: 'No transactions found for the selected month.' });
        }

        res.status(200).json({
            totalSales: stats[0].totalSales,
            soldItems: stats[0].soldItems,
            unsoldItems: stats[0].unsoldItems,
        });
    }catch(err){
        res.status(500).json({ message: 'Error fetching statistics', error: err.message });
    }
})


app.get('/bar-chart', async (req, res) => {
    const { month } = req.query;
  
    if (!month || !['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].includes(month)) {
      return res.status(400).json({ message: 'Invalid month input. Please provide a valid month (January to December).' });
    }
  
    try {
      const monthNumber = new Date(Date.parse(month + " 1, 2024")).getMonth(); 
      console.log(`Month number for ${month}: ${monthNumber + 1}`);
  
      const result = await transactionSchema.aggregate([
        {
          $match: {
            $expr: {
              $eq: [{ $month: "$dateOfSale" }, monthNumber + 1], 
            }
          }
        },
        {
          $bucket: {
            groupBy: "$price", 
            boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Number.MAX_VALUE],  
            default: "Other",  
            output: {
              count: { $sum: 1 }, 
            }
          }
        },
        {
          $project: {
            priceRange: "$_id",  
            count: 1,  
            _id: 0,  
          },
        },
        {
          $sort: {
            priceRange: 1, 
          },
        },
      ]);
  
      if (result.length === 0) {
        return res.status(200).json({ message: 'No transactions found for the selected month.' });
      }
  
      const response = [
        { priceRange: '0 - 100', count: 0 },
        { priceRange: '101 - 200', count: 0 },
        { priceRange: '201 - 300', count: 0 },
        { priceRange: '301 - 400', count: 0 },
        { priceRange: '401 - 500', count: 0 },
        { priceRange: '501 - 600', count: 0 },
        { priceRange: '601 - 700', count: 0 },
        { priceRange: '701 - 800', count: 0 },
        { priceRange: '801 - 900', count: 0 },
        { priceRange: '901-above', count: 0 },
      ];
  
      result.forEach(item => {
        const priceRange = item.priceRange;
        switch (true) {
          case (priceRange >= 0 && priceRange <= 100):
            response[0].count = item.count;
            break;
          case (priceRange > 100 && priceRange <= 200):
            response[1].count = item.count;
            break;
          case (priceRange > 200 && priceRange <= 300):
            response[2].count = item.count;
            break;
          case (priceRange > 300 && priceRange <= 400):
            response[3].count = item.count;
            break;
          case (priceRange > 400 && priceRange <= 500):
            response[4].count = item.count;
            break;
          case (priceRange > 500 && priceRange <= 600):
            response[5].count = item.count;
            break;
          case (priceRange > 600 && priceRange <= 700):
            response[6].count = item.count;
            break;
          case (priceRange > 700 && priceRange <= 800):
            response[7].count = item.count;
            break;
          case (priceRange > 800 && priceRange <= 900):
            response[8].count = item.count;
            break;
          case (priceRange > 900):
            response[9].count = item.count;
            break;
          default:
            break;
        }
      });
  
      res.status(200).json({ data: response });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching statistics', error: err.message });
    }
});


app.get('/pie-chart', async (req, res) => {
    const { month } = req.query;

    if (!month || !['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].includes(month)) {
      return res.status(400).json({ message: 'Invalid month input. Please provide a valid month (January to December).' });
    }
  
    try {
      const monthNumber = new Date(Date.parse(month + " 1, 2024")).getMonth(); 
      console.log(`Month number for ${month}: ${monthNumber + 1}`);
      const result = await transactionSchema.aggregate([
        {
          $match: {
            $expr: {
              $eq: [{ $month: "$dateOfSale" }, monthNumber + 1], 
            },
          },
        },
        {
          $group: {
            _id: "$category",  
            count: { $sum: 1 }, 
          },
        },
        {
          $project: {
            category: "$_id", 
            count: 1,  
            _id: 0,  
          },
        },
        {
          $sort: {
            category: 1,
          },
        },
      ]);
  
      if (result.length === 0) {
        return res.status(200).json({ message: 'No transactions found for the selected month.' });
      }
  
      res.status(200).json({ data: result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching statistics', error: err.message });
    }
  });


  app.get('/combined-stats', async (req, res) => {
    const { month } = req.query;

    if (!month || !['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].includes(month)) {
      return res.status(400).json({ message: 'Invalid month input. Please provide a valid month (January to December).' });
    }
  
    try {
      const [ statisticsData, barChartData, pieChartData] = await Promise.all([
        axios.get(`http://localhost:${port}/statistics?month=${month}`),
        axios.get(`http://localhost:${port}/bar-chart?month=${month}`),
        axios.get(`http://localhost:${port}/pie-chart?month=${month}`)
      ]);
  
      const combinedResponse = {
        statistics: statisticsData.data,
        barChart: barChartData.data,
        pieChart: pieChartData.data
      };
  
      res.status(200).json(combinedResponse);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching combined statistics', error: err.message });
    }
  });


app.listen(port,()=>{
    console.log(`Server is running in Port:${port}`)
})
