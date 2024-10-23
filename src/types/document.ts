export interface DocumentAPI {
    id: string;
    key: string;  // This will act as the title
    resource: string; // Represents category
    created_at: string;  // Date as a string, will be converted in frontend
    updated_at: string;  // Date as a string, will be converted in frontend
}

export interface Document {
    id: string;
    title: string;
    category: string;
    created_at: Date;
    lastModified: Date;
    author: string;
    status: 'draft' | 'published';
    owner: string;
    key: string;
}
