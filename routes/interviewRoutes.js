const express = require('express');
const router = express.Router();

const InterviewSlot = require('../models/InterviewSlot');

// ========================================
// GET ALL INTERVIEW SLOTS
// GET /api/v1/interviews
// ========================================

router.get('/', async (req, res, next) => {
  try {
    const interviews = await InterviewSlot.find();

    return res.status(200).json({
      data: interviews,
      meta: {
        count: interviews.length,
        api_version: 'v1',
        correlation_id: req.correlationId
      }
    });

  } catch (error) {
    next(error);
  }
});


// ========================================
// GET ONE INTERVIEW SLOT
// GET /api/v1/interviews/:slotId
// ========================================

router.get('/:slotId', async (req, res, next) => {
  try {
    const interview = await InterviewSlot.findById(req.params.slotId);

    if (!interview) {
      return res.status(404).json({
        error: {
          code: 'INTERVIEW_SLOT_NOT_FOUND',
          message: 'Interview slot not found'
        },
        meta: {
          correlation_id: req.correlationId
        }
      });
    }

    return res.status(200).json({
      data: interview,
      meta: {
        api_version: 'v1',
        correlation_id: req.correlationId
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;