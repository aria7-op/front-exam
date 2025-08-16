const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { Notification } = require('../models');
const { logSecurity } = require('../utils/logger');

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, read } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.userId };
    if (read !== undefined) whereClause.isRead = read === 'true';

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: notifications,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: count, pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    logSecurity('Notification Retrieval Error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ success: false, message: 'Failed to get notifications', error: error.message });
  }
});

// Mark notification as read
router.put('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOne({
      where: { id: notificationId, userId: req.user.userId }
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await notification.update({ isRead: true });

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    logSecurity('Notification Update Error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ success: false, message: 'Failed to update notification', error: error.message });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.userId, isRead: false } }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    logSecurity('Bulk Notification Update Error', { error: error.message, userId: req.user?.userId });
    res.status(500).json({ success: false, message: 'Failed to update notifications', error: error.message });
  }
});

module.exports = router; 