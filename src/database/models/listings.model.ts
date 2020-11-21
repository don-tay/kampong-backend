export interface ListingsView {
    listing_id: string;
    organisation_id: number;
    created_by: string;
    title: string;
    category: string;
    about: string;
    tagline: string;
    mission: string;
    listing_url: string;
    listing_email: string;
    pic1: string;
    pic2: string;
    pic3: string;
    pic4: string;
    pic5: string;
    is_published: boolean;
    is_verified: boolean;
    start_date: Date;
    end_date: Date;
    created_on: Date;
    deleted_on: Date;
    nickname: string;
    profile_picture: string;
    locations: string[];
    location_ids: number;
}