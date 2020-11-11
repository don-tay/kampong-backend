import { db } from '../database/db';
import { asyncHandler } from '../middleware';
import { checkListingOwner, cleanseData, ErrorResponse, parseSqlUpdateStmt } from '../utils';

/**
 * @desc    Get all milestones
 * @route   GET /api/milestones
 * @desc    Get all milestones for a listing
 * @route   GET /api/listings/:listing_id/milestones
 * @access  Public
 */
export const getMilestones = asyncHandler(async (req, res, next) => {
    if (req.params.listing_id) {
        // returns 404 error response if listing not found
        const milestones = await db.many(
            'SELECT l.listing_id, m.milestone_id, description, m.date FROM listingsview l LEFT JOIN milestones m ON l.listing_id = m.listing_id WHERE l.listing_id = $1',
            req.params.listing_id,
        );

        // remove null milestone_id from result
        const data = milestones.filter((m) => m.milestone_id !== null);

        return res.status(200).json({
            success: true,
            count: data.length,
            data,
        });
    }

    res.status(200).json(res.advancedResults);
});

/**
 * @desc    Get single milestone
 * @route   GET /api/milestones/:id
 * @access  Public
 */
export const getMilestone = asyncHandler(async (req, res) => {
    const rows = await db.one('SELECT * FROM milestones WHERE milestone_id = $1', req.params.id);
    res.status(200).json({
        success: true,
        data: rows,
    });
});

/**
 * @desc    Create milestone
 * @route   POST /api/milestones
 * @access  Owner/Admin
 */
export const createMilestone = asyncHandler(async (req, res, next) => {
    const { listing_id, description, date } = req.body;

    const data = {
        listing_id,
        description,
        date,
    };

    cleanseData(data);

    const isListingOwner = await checkListingOwner(req.user.user_id, listing_id);

    // check listing owner for non-admin users
    if (!(req.user.role === 'admin' || isListingOwner)) {
        return next(new ErrorResponse(`Not authorised to create milestone for this listing`, 403));
    }

    const rows = await db.one('INSERT INTO milestones (${this:name}) VALUES (${this:csv}) RETURNING *', data);

    res.status(201).json({
        success: true,
        data: rows,
    });
});

/**
 * @desc    Update single milestone
 * @route   PUT /api/milestones/:id
 * @access  Owner/Admin
 */
export const updateMilestone = asyncHandler(async (req, res, next) => {
    // check if milestone exists
    const milestone = await db.one('SELECT * FROM milestones WHERE milestone_id = $1', req.params.id);

    const isListingOwner = await checkListingOwner(req.user.user_id, milestone.listing_id);

    // check listing owner for non-admin users
    if (!(req.user.role === 'admin' || isListingOwner)) {
        return next(new ErrorResponse(`Not authorised to update milestone for this listing`, 403));
    }

    const { description, date } = req.body;

    const data = {
        description,
        date,
    };

    cleanseData(data);

    const updateMilestoneQuery = parseSqlUpdateStmt(data, 'milestones', 'WHERE milestone_id = $1 RETURNING *', [req.params.id]);

    const rows = await db.one(updateMilestoneQuery);

    res.status(200).json({
        success: true,
        data: rows,
    });
});

/**
 * @desc    Delete single milestone
 * @route   DELETE /api/milestones/:id
 * @access  Owner/Admin
 */
export const deleteMilestone = asyncHandler(async (req, res, next) => {
    // check if milestone exists
    const milestone = await db.one('SELECT * FROM milestones WHERE milestone_id = $1', req.params.id);

    const isListingOwner = await checkListingOwner(req.user.user_id, milestone.listing_id);

    // check listing owner for non-admin users
    if (!(req.user.role === 'admin' || isListingOwner)) {
        return next(new ErrorResponse(`Not authorised to delete milestone for this listing`, 403));
    }

    const rows = await db.one('DELETE FROM milestones WHERE milestone_id = $1 RETURNING *', req.params.id);

    res.status(200).json({
        success: true,
        data: rows,
    });
});
