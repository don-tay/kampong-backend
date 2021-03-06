import express from 'express';
export const router = express.Router({ mergeParams: true });
import { check, oneOf } from 'express-validator';
import { checkInputError, protect } from '../../middleware';
import { NO_FIELD_UPDATED_MSG, INVALID_FIELD_MSG } from '../../utils';

// import controllers here
import { getListingUpdatesForListing, createListingUpdate, modifyListingUpdate, deleteListingUpdate } from '../../controllers/listingUpdates';

// Define input validation chain
const validateCreateListingUpdateFields = [
    check('listing_id', INVALID_FIELD_MSG('listing id')).isUUID(),
    check('listing_update_description', INVALID_FIELD_MSG('listing_update_description')).trim().notEmpty(),
    check('pics').isArray(),
];

const validateModifyListingUpdateFields = [
    oneOf([check('listing_update_description').exists(), check('pics').exists()], NO_FIELD_UPDATED_MSG),
    check('listing_update_description', INVALID_FIELD_MSG('listing_update_description')).optional().trim().notEmpty(),
    check('pics').optional().isArray(),
];

router.route('/').get(getListingUpdatesForListing);

// all routes below only accessible to authenticated user (specifically, listing owner, to be implemented)
router.use(protect);

// map routes to controller
router.route('/').post(validateCreateListingUpdateFields, checkInputError, createListingUpdate);
router.route('/:id').put(validateModifyListingUpdateFields, checkInputError, modifyListingUpdate).delete(deleteListingUpdate);
