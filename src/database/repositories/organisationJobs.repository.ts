import { BaseRepository } from './base.repository';
import { OrganisationJob, CreateOrganisationJobSchema, UpdateOrganisationJobSchema } from '../models';

export class OrganisationJobsRepository extends BaseRepository {
    getAllJobsForOrganisation(organisationId: string): Promise<OrganisationJob[]> {
        return this.db.manyOrNone('SELECT * FROM organisationjob WHERE organisation_id = $1', organisationId);
    }

    getOrganisationJobById(organisationJobId: string): Promise<OrganisationJob> {
        return this.db.one('SELECT * FROM organisationjob WHERE organisation_job_id = $1', organisationJobId);
    }

    createOrganisationJob(createOrganisationJobData: CreateOrganisationJobSchema): Promise<OrganisationJob> {
        return this.db.one('INSERT INTO organisationjob (${this:name}) VALUES (${this:csv}) RETURNING *', createOrganisationJobData);
    }

    updateOrganisationJobById(updateOrganisationJobData: UpdateOrganisationJobSchema, organisationJobId: string): Promise<OrganisationJob> {
        const updateOrganisationJobQuery =
            this.pgp.helpers.update(updateOrganisationJobData, null, 'organisationjob') +
            this.pgp.as.format(' WHERE organisation_job_id = $1 RETURNING *', organisationJobId);
        return this.db.one(updateOrganisationJobQuery);
    }

    deleteOrganisationJobById(organisationJobId: string): Promise<OrganisationJob> {
        return this.db.one('DELETE FROM organisationjob WHERE organisation_job_id = $1 RETURNING *', organisationJobId);
    }
}
