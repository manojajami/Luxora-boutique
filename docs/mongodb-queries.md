# MongoDB queries used in LUXORA (mongosh)
```js
use luxora
db.products.find({ category: "Dresses" })                          // by category
db.products.find({ name: /dress/i })                               // search
db.products.find({ price: { $gte: 1000, $lte: 2500 } }).sort({ price: 1 })  // price filter + sort
db.products.find({ stock: { $lt: 10 } })                           // low stock
db.orders.find({ user: ObjectId("USER_ID") })                      // a user's orders
db.orders.countDocuments()                                         // total orders
db.orders.aggregate([{ $match: { status: { $ne: "Cancelled" } } },
  { $group: { _id: null, totalSales: { $sum: "$total" } } }])      // total sales
db.orders.aggregate([{ $match: { status: { $ne: "Cancelled" } } },
  { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, revenue: { $sum: "$total" } } },
  { $sort: { _id: 1 } }])                                          // monthly revenue
db.orders.aggregate([{ $unwind: "$items" },
  { $group: { _id: "$items.name", sold: { $sum: "$items.qty" } } },
  { $sort: { sold: -1 } }, { $limit: 5 }])                         // popular products
```
