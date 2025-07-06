const Notification = require("../models/notification.model");
const { DatabaseError } = require("../errors");

exports.createNotification = async (data) => {
    const notification = new Notification(data);
    await notification.save();
    return notification;
};

exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .populate("senderId", "firstName lastName")
            .sort({ createdAt: -1 })
            .limit(20);

        const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

        res.json({ success: true, data: notifications, unreadCount });
    } catch (error) {
        next(new DatabaseError("Failed to fetch notifications"));
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const notificationId = req.params.notificationId;
        await Notification.updateOne({ _id: notificationId, userId: req.user._id }, { isRead: true });
        res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
        next(new DatabaseError("Failed to update notification"));
    }
};