const { db, parseSqlUpdateStmt } = require('../config/db');
const asyncHandler = require('../middleware/async');
const { cleanseData } = require('../utils/dbHelper');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Get all listings
 * @route   GET /api/listings
 * @access  Public
 */
exports.getListings = asyncHandler(async (req, res) => {
  res.status(200).json(res.advancedResults);
});

/**
 * @desc    Get single listing
 * @route   GET /api/listings/:id
 * @access  Public
 */
exports.getListing = asyncHandler(async (req, res) => {
  const rows = await db.one(
    'SELECT * FROM listings WHERE listing_id = $1',
    req.params.id
  );
  res.status(200).json({
    success: true,
    data: rows,
  });
});

/**
 * @desc    Create listing
 * @route   POST /api/listings
 * @access  Private
 */
exports.createListing = asyncHandler(async (req, res) => {
  const {
    organisation_id, // NOTE: do not use this field until organisations endpoint is implemented
    title,
    category,
    about,
    tagline,
    mission,
    listing_url,
    is_published,
    start_date,
    end_date,
  } = req.body;

  const data = {
    organisation_id,
    title,
    category,
    about,
    tagline,
    mission,
    listing_url,
    is_published,
    start_date,
    end_date,
  };

  // Add logged in user as creator of listing
  data.created_by = req.user.user_id;

  // remove undefined values in json object
  cleanseData(data);

  const rows = await db.one(
    'INSERT INTO listings (${this:name}) VALUES (${this:csv}) RETURNING *',
    data
  );

  res.status(201).json({
    success: true,
    data: rows,
  });
});

/**
 * @desc    Update single listing
 * @route   PUT /api/listings/:id
 * @access  Admin/Owner
 */
exports.updateListing = asyncHandler(async (req, res, next) => {
  // check if listing exists
  const listing = await db.oneOrNone(
    'SELECT * FROM listings WHERE listing_id = $1',
    req.params.id
  );

  // return bad request response if invalid listing
  if (!listing) {
    return next(new ErrorResponse(`Listing does not exist`, 400));
  }

  // Unauthorised if neither admin nor listing owner
  if (!(req.user.role === 'admin' || req.user.user_id === listing.created_by)) {
    return next(
      new ErrorResponse(`User not authorised to update this listing`, 403)
    );
  }

  const {
    organisation_id, // NOTE: do not use this field until organisations endpoint is implemented
    title,
    category,
    about,
    tagline,
    mission,
    listing_url,
    is_published,
    start_date,
    end_date,
  } = req.body;

  const data = {
    organisation_id,
    title,
    category,
    about,
    tagline,
    mission,
    listing_url,
    is_published,
    start_date,
    end_date,
  };

  // remove undefined items in json
  cleanseData(data);

  const updateListingQuery = parseSqlUpdateStmt(
    data,
    'listings',
    'WHERE listing_id = $1 RETURNING *',
    [req.params.id]
  );

  const rows = await db.one(updateListingQuery);

  res.status(200).json({
    success: true,
    data: rows,
  });
});

/**
 * @desc    Verify single listing
 * @route   PUT /api/listings/:id/verify
 * @access  Admin
 */
exports.verifyListing = asyncHandler(async (req, res, next) => {
  // check if listing exists
  const isValidListing = await db.oneOrNone(
    'SELECT * FROM listings WHERE listing_id = $1',
    req.params.id
  );

  // return bad request response if invalid listing
  if (!isValidListing) {
    return next(new ErrorResponse(`Listing does not exist`, 400));
  }

  const { is_verified } = req.body;

  const data = { is_verified };

  const verifyListingQuery = parseSqlUpdateStmt(
    data,
    'listings',
    'WHERE listing_id = $1 RETURNING *',
    [req.params.id]
  );

  const rows = await db.one(verifyListingQuery);

  res.status(200).json({
    success: true,
    data: rows,
  });
});

/**
 * @desc    Delete single listing
 * @route   DELETE /api/listings/:id
 * @access  Admin/Owner
 */
exports.deleteListing = asyncHandler(async (req, res, next) => {
  // check if listing exists
  const listing = await db.oneOrNone(
    'SELECT * FROM listings WHERE listing_id = $1',
    req.params.id
  );

  // return bad request response if invalid listing
  if (!listing) {
    return next(new ErrorResponse(`Listing does not exist`, 400));
  }

  // Unauthorised if neither admin nor listing owner
  if (!(req.user.role === 'admin' || req.user.user_id === listing.created_by)) {
    return next(
      new ErrorResponse(`User not authorised to delete this listing`, 403)
    );
  }

  const rows = await db.one(
    'DELETE FROM listings WHERE listing_id = $1 RETURNING *',
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: rows,
  });
});

/**
 * @desc    Upload new or update multiple listing pictures
 * @route   PUT /api/listings/:id/photo
 * @access  Admin/Owner
 */
exports.uploadListingPics = asyncHandler(async (req, res, next) => {
  // check if listing exists
  const listing = await db.one(
    'SELECT * FROM listings WHERE listing_id = $1',
    req.params.id
  );

  // Unauthorised if neither admin nor listing owner
  if (!(req.user.role === 'admin' || req.user.user_id === listing.created_by)) {
    return next(
      new ErrorResponse(
        `User not authorised to upload photo for this listing`,
        403
      )
    );
  }

  console.log(req.files);

  const pictures = req.files;

  const data = {
    pic1: null,
    pic2: null,
    pic3: null,
    pic4: null,
    pic5: null,
  };

  // TODO: improve logic as now, order of input to new pics is from pic1 to 5
  // regardless if pic1 to 5 already exist in db entry
  Object.keys(data).map(pic => (data[pic] = pictures.shift().location));
  cleanseData(data);

  const updateProfileQuery = parseSqlUpdateStmt(
    data,
    'listings',
    'WHERE listing_id = $1 RETURNING pic1, pic2, pic3, pic4, pic5',
    req.params.id
  );

  const rows = await db.one(updateProfileQuery);

  res.status(200).json({
    success: true,
    data: rows,
  });
});
