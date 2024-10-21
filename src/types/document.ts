export interface DocumentAPI {
    id: string;
    title: string;
    category: string;
    lastModified: string;
    author: string;
    status: 'draft' | 'published';
}

export interface Document {
    id: string;
    title: string;
    category: string;
    lastModified: Date;
    author: string;
    status: 'draft' | 'published';
}