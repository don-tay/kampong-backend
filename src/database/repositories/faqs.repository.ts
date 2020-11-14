import { IDatabase, IMain } from 'pg-promise';
import { CreateFaqSchema, Faqs, UpdateFaqSchema } from '../models';

/**
 * @param db
 * Automated database connection context/interface.
 *
 * If you ever need to access other repositories from this one,
 * you will have to replace type 'IDatabase<any>' with 'any'.
 *
 * @param pgp
 * Library's root, if ever needed, like to access 'helpers'
 * or other namespaces available from the root.
 */
export class FaqsRepository {
    constructor(private db: IDatabase<any>, private pgp: IMain) {
        this.db = db;
        this.pgp = pgp;
    }

    getAllFaqsForListing(listingId: string): Promise<Faqs[]> {
        return this.db.manyOrNone('SELECT * FROM faqs WHERE listing_id = $1', listingId);
    }

    getFaqById(faqId: string): Promise<Faqs> {
        return this.db.one('SELECT * FROM faqs WHERE faq_id = $1', faqId);
    }

    createFaq(createFaqData: CreateFaqSchema): Promise<Faqs> {
        return this.db.one('INSERT INTO faqs (${this:name}) VALUES (${this:csv}) RETURNING *', createFaqData);
    }

    updateFaqById(updateFaqData: UpdateFaqSchema, faqId: string): Promise<Faqs> {
        const updateFaqQuery = this.pgp.helpers.update(updateFaqData, null, 'faqs') + this.pgp.as.format(' WHERE faq_id = $1 RETURNING *', faqId);
        return this.db.one(updateFaqQuery);
    }

    deleteFaqById(faqId: string): Promise<Faqs> {
        return this.db.one('DELETE FROM faqs WHERE faq_id = $1 RETURNING *', faqId);
    }
}
