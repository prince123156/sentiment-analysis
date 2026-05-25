import Message from "../models/Message.js";
import Room from "../models/Room.js";
import User from "../models/User.js";

export async function getDashboard(req, res) {
  const [totalMessages, activeUsers, totalRooms, sentimentDistribution, activity] =
    await Promise.all([
      Message.countDocuments(),
      User.countDocuments({ isOnline: true }),
      Room.countDocuments(),
      Message.aggregate([
        { $group: { _id: "$sentiment.label", count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Message.aggregate([
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 14 }
      ])
    ]);

  return res.json({
    totalMessages,
    activeUsers,
    totalRooms,
    sentimentDistribution,
    activity
  });
}
