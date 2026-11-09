export default function handler(req, res) {
  return res.status(200).json({
    success: true,
    message: "I marketplaces Backend API is running!",
    project: "I marketplaces market place",
    status: "online"
  });
}
