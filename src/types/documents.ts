export interface Document {
    id: string;
    title: string;
    category: string;
    created_at: Date;
    lastModified: Date;
    author: string;
    status: 'draft' | 'published';
    owner: string;
}