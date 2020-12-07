import { CategoriesRepository } from './categories.repository';
import { FaqsRepository } from './faqs.repository';
import { HashtagsRepository } from './hashtags.repository';
import { JobsRepository } from './jobs.repository';
import { ListingsRepository } from './listings.repository';

// Database Interface Extensions (Add repositories here):
interface IExtensions {
    categories: CategoriesRepository;
    faqs: FaqsRepository;
    jobs: JobsRepository;
    listings: ListingsRepository;
    hashtags: HashtagsRepository;
}

export { IExtensions, CategoriesRepository, FaqsRepository, HashtagsRepository, JobsRepository, ListingsRepository };
