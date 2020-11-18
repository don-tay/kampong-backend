DROP VIEW IF EXISTS featuredlistingsview CASCADE;
DROP VIEW IF EXISTS ListingsView CASCADE;
DROP VIEW IF EXISTS OrganisationsView CASCADE;
DROP VIEW IF EXISTS JobsView CASCADE;
DROP VIEW IF EXISTS ListingCommentsView CASCADE;

CREATE VIEW ListingsView AS WITH CombinedListingLocations AS (
	SELECT
		ls.listing_id,
		ARRAY_AGG(lo.location) AS location,
		ARRAY_AGG(lo.location_id) AS location_ids
	FROM
		listing ls
		JOIN (listinglocations lsl
			JOIN location lo ON lsl.location_id = lo.location_id) ON ls.listing_id = lsl.listing_id
	GROUP BY
		ls.listing_id
)
SELECT
	l.*,
	p.nickname,
	p.profile_picture,
	cll.locations,
	cll.location_ids,
	to_tsvector(l.title || ' ' || l.category || ' ' || array_to_string(cll.locations::text[], ' ')) AS keyword_vector
FROM
	listing l
	LEFT JOIN CombinedListingLocations cll ON l.listing_id = cll.listing_id
	LEFT JOIN profile p ON l.created_by = p.user_id
WHERE
	deleted_on IS NULL;

CREATE VIEW OrganisationsView AS
	SELECT *
  	FROM organisation
  	WHERE deleted_on IS NULL;

CREATE VIEW JobsView AS
  	SELECT *
  	FROM job
  	WHERE deleted_on IS NULL;

CREATE VIEW ListingCommentsView AS
	SELECT lc.*, p.nickname, p.profile_picture
	FROM ListingComments lc
	LEFT JOIN profile p
	ON lc.user_id = p.user_id
	WHERE lc.deleted_on IS NULL;
  
CREATE VIEW featuredlistingsview AS
	SELECT *
	FROM listingsview
	WHERE is_featured = TRUE;
