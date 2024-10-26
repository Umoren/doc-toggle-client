// src/pages/documents.tsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import apiClient from '@/lib/api';
import Layout from '@/components/Layout';
import DocumentList from '@/components/DocumentList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/context/AppContext';
import { Can } from '@casl/react';

interface Document {
    id: string;
    title: string;
    category: string;
    created_at: Date;
    lastModified: Date;
    author: string;
    status: 'draft' | 'published';
    owner: string;
}

const fetchDocuments = async (): Promise<Document[]> => {
    const response = await apiClient.get('/api/policies/documents');
    return response.data.map((doc: any) => ({
        id: doc.id,
        title: doc.key, // Using 'key' as 'title'
        category: doc.resource || 'Uncategorized',
        created_at: new Date(doc.created_at),
        lastModified: new Date(doc.updated_at),
        author: 'Unknown',
        status: 'draft',
        owner: doc.tenant || 'Unknown',
    }));
};

const createDocument = async (document: Omit<Document, 'id' | 'created_at' | 'lastModified'>): Promise<Document> => {
    const response = await apiClient.post('/api/policies/documents', document);
    return response.data;
};

const deleteDocument = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/policies/documents/${id}`);
};

export default function DocumentsPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newDocument, setNewDocument] = useState<Omit<Document, 'id' | 'created_at' | 'lastModified'>>({
        title: '',
        category: '',
        author: '',
        status: 'draft',
        owner: '',
    });
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { ability } = useApp();

    const { data: documents, isLoading, error } = useQuery('documents', fetchDocuments);

    const createMutation = useMutation(createDocument, {
        onSuccess: () => {
            queryClient.invalidateQueries('documents');
            setIsCreateDialogOpen(false);
            setNewDocument({
                title: '',
                category: '',
                author: '',
                status: 'draft',
                owner: '',
            });
            toast({ title: 'Document Created', description: 'The new document has been successfully created.' });
        },
        onError: () => {
            toast({ title: 'Error', description: 'Failed to create document.', variant: 'destructive' });
        },
    });

    const deleteMutation = useMutation(deleteDocument, {
        onSuccess: () => {
            queryClient.invalidateQueries('documents');
            toast({ title: 'Document Deleted', description: 'The document has been successfully deleted.' });
        },
        onError: () => {
            toast({ title: 'Error', description: 'Failed to delete document.', variant: 'destructive' });
        },
    });

    const handleCreateDocument = () => {
        createMutation.mutate(newDocument);
    };

    const handleDeleteDocument = (id: string) => {
        deleteMutation.mutate(id);
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Documents</h1>

                {isLoading ? (
                    <div>Loading documents...</div>
                ) : error ? (
                    <div>An error occurred: {error instanceof Error ? error.message : 'Unknown error'}</div>
                ) : (
                    <DocumentList
                        documents={documents || []}
                        onCreateDocument={() => setIsCreateDialogOpen(true)}
                        onEditDocument={() => {
                            /* Implement editing logic */
                        }}
                        onDeleteDocument={handleDeleteDocument}
                        onSort={() => {
                            /* Implement sorting logic */
                        }}
                        onFilter={() => {
                            /* Implement filtering logic */
                        }}
                        onShareDocument={() => {
                            /* Implement sharing logic */
                        }}
                    />
                )}

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Document</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="documentTitle" className="block text-sm font-medium text-gray-700">
                                    Document Title
                                </label>
                                <Input
                                    id="documentTitle"
                                    value={newDocument.title}
                                    onChange={(e) => setNewDocument((prev) => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter document title"
                                />
                            </div>
                            <div>
                                <label htmlFor="documentCategory" className="block text-sm font-medium text-gray-700">
                                    Category
                                </label>
                                <Input
                                    id="documentCategory"
                                    value={newDocument.category}
                                    onChange={(e) => setNewDocument((prev) => ({ ...prev, category: e.target.value }))}
                                    placeholder="Enter category"
                                />
                            </div>
                            <div>
                                <label htmlFor="documentAuthor" className="block text-sm font-medium text-gray-700">
                                    Author
                                </label>
                                <Input
                                    id="documentAuthor"
                                    value={newDocument.author}
                                    onChange={(e) => setNewDocument((prev) => ({ ...prev, author: e.target.value }))}
                                    placeholder="Enter author name"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Can I="create" a="Document" ability={ability}>
                                <Button onClick={handleCreateDocument} disabled={!newDocument.title.trim() || !newDocument.category}>
                                    Create
                                </Button>
                            </Can>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
}
