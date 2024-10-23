import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import apiClient from '@/lib/api'
import { Home, ChevronRight, Plus } from 'lucide-react'
import { parseISO } from 'date-fns'
import Layout from '@/components/Layout'
import DocumentList from '@/components/DocumentList'
import { Document, DocumentAPI } from '@/types/document'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApp } from '@/context/AppContext'
import { permitState } from 'permit-fe-sdk'

// Types and Interfaces

interface FetchDocumentsParams {
    pageParam?: number
    filters?: Record<string, string>
    sort?: Record<string, 'asc' | 'desc'>
}

interface FetchDocumentsResponse {
    documents: DocumentAPI[]
    totalPages: number
}

// API Functions
const fetchDocuments = async ({ pageParam = 1, filters = {}, sort = {} }: FetchDocumentsParams): Promise<FetchDocumentsResponse> => {
    const response = await apiClient.get('/api/policies/documents', {
        params: { page: pageParam, ...filters, ...sort }
    });
    return response.data;
};

const createDocument = async (document: Omit<Document, 'id'>, userId: string): Promise<Document> => {
    const response = await apiClient.post('/api/policies/documents', document, {
        headers: {
            'user-id': userId // Pass userId in the headers
        }
    });
    return response.data;
};

const updateDocument = async (document: Document, userId: string): Promise<Document> => {
    const response = await apiClient.put(`/api/policies/documents/${document.id}`, document, {
        headers: {
            'user-id': userId // Pass userId in the headers
        }
    });
    return response.data;
};

const deleteDocument = async (id: string, userId: string): Promise<void> => {
    await apiClient.delete(`/api/policies/documents/${id}`, {
        headers: {
            'user-id': userId // Pass userId in the headers
        }
    });
};


// Main Component
export default function DocumentsPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [newDocument, setNewDocument] = useState<Omit<Document, 'id'>>({
        title: '',
        category: '',
        lastModified: new Date(),
        author: '',
        status: 'draft',
        owner: '',
        key: '',
        created_at: new Date()
    });

    const [currentPage, setCurrentPage] = useState(1)
    const [filters, setFilters] = useState<Record<string, string>>({})
    const [sort, setSort] = useState<Record<string, 'asc' | 'desc'>>({})
    const { checkPermission, userId, isPermitReady } = useApp();  // Get checkPermission from context
    const [canCreateDocument, setCanCreateDocument] = useState(false);

    const { toast } = useToast()
    const queryClient = useQueryClient()


    // Queries and Mutations
    const { data, isLoading, error } = useQuery<FetchDocumentsResponse, Error>(
        ['documents', currentPage, filters, sort],
        () => fetchDocuments({ pageParam: currentPage, filters, sort })
    );


    const documents: Document[] = Array.isArray(data)
        ? data.map((doc: DocumentAPI) => ({
            id: doc.id,
            title: doc.key,  // Treat 'key' as the title for UI purposes
            category: doc.resource,  // 'resource' field as category
            created_at: new Date(doc.created_at),  // Convert API string to Date
            lastModified: new Date(doc.updated_at),  // Convert API string to Date
            author: '',  // Default value if author is not available
            status: 'draft',  // Default value if status is not provided
            owner: '',  // Default value for owner
            key: doc.key  // Use the 'key' field from the API
        }))
        : [];


    useEffect(() => {

        const fetchPermissions = async () => {
            if (isPermitReady) {
                const canCreate = await checkPermission('create', 'Document', 'default_document_resource');

                setCanCreateDocument(canCreate);
            } else {
                console.log("Permit is not ready yet.");
            }
        };

        if (userId && isPermitReady) {
            fetchPermissions();
        }
    }, [userId, checkPermission, isPermitReady]);




    const createMutation = useMutation((document: Omit<Document, 'id'>) => createDocument(document, userId!), {
        onSuccess: () => {
            queryClient.invalidateQueries('documents');
            setIsCreateDialogOpen(false);
            setNewDocument({
                title: '',
                category: '',
                created_at: new Date(),
                lastModified: new Date(),
                author: '',
                status: 'draft',
                owner: '',
                key: ''
            });

            toast({
                title: "Document Created",
                description: "The new document has been successfully created.",
                variant: "default", // Ensure variant is correctly set (default or another)
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: `Failed to create document: ${error.message}`,
                variant: "destructive",
            });
        },
    });

    const updateMutation = useMutation((document: Document) => updateDocument(document, userId!), {
        onSuccess: () => {
            queryClient.invalidateQueries('documents');
            toast({
                title: "Document Updated",
                description: "The document has been successfully updated.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: `Failed to update document: ${error.message}`,
                variant: "destructive",
            });
        },
    });

    const deleteMutation = useMutation((id: string) => deleteDocument(id, userId!), {
        onSuccess: () => {
            queryClient.invalidateQueries('documents');
            toast({
                title: "Document Deleted",
                description: "The document has been successfully deleted.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: `Failed to delete document: ${error.message}`,
                variant: "destructive",
            });
        },
    });


    // Handlers
    const handleCreateDocument = useCallback(async () => {
        if (!newDocument.title || !newDocument.category) {
            toast({
                title: "Invalid Data",
                description: "Please fill in all required fields to create a document.",
                variant: "destructive",
            });
            return;
        }

        const hasPermission = await checkPermission('create', 'Document', 'default_document_resource');
        if (hasPermission) {
            createMutation.mutate(newDocument); // userId is passed in mutation
        } else {
            toast({
                title: "Permission Denied",
                description: "You don't have permission to create documents.",
                variant: "destructive",
            });
        }
    }, [newDocument, createMutation, toast, checkPermission]);

    const handleUpdateDocument = useCallback(async (document: Document) => {
        const hasPermission = await checkPermission('update', 'Document', document.id);
        if (hasPermission || userId === document.owner) {
            updateMutation.mutate(document);
        } else {
            toast({
                title: "Permission Denied",
                description: "You don't have permission to update this document.",
                variant: "destructive",
            });
        }
    }, [userId, updateMutation, toast, checkPermission]);

    const handleDeleteDocument = useCallback(async (id: string) => {
        const document = documents.find(doc => doc.id === id);
        const hasPermission = await checkPermission('delete', 'Document', document?.id || '');

        if (hasPermission || userId === document?.owner) {
            deleteMutation.mutate(id);
        } else {
            toast({
                title: "Permission Denied",
                description: "You don't have permission to delete this document.",
                variant: "destructive",
            });
        }
    }, [userId, deleteMutation, documents, toast, checkPermission]);

    const handleFilter = useCallback((key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setCurrentPage(1)
    }, [])

    const handleSort = useCallback((key: string) => {
        setSort(prev => ({ [key]: prev[key] === 'asc' ? 'desc' : 'asc' }))
        setCurrentPage(1)
    }, [])


    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <Breadcrumb className="mb-4">
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">
                            <Home className="h-4 w-4" />
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <ChevronRight className="h-4 w-4" />
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/documents">Documents</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Documents</h1>
                    {canCreateDocument && (
                        <>
                            <Button onClick={() => setIsCreateDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Create Document
                            </Button>
                            <p>Can create document is TRUE.</p>
                        </>
                    )}
                </div>

                {isLoading ? (
                    <div className="text-center py-10">Loading documents...</div>
                ) : error ? (
                    <div className="text-center py-10 text-red-500">Error loading documents: {error.message}</div>
                ) : (
                    <>
                        <DocumentList
                            documents={documents}
                            onCreateDocument={() => setIsCreateDialogOpen(true)}
                            onEditDocument={handleUpdateDocument}
                            onDeleteDocument={handleDeleteDocument}
                            onSort={handleSort}
                            onFilter={handleFilter}
                            onShareDocument={() => { /* Placeholder for sharing logic */ }}
                        />

                        <div className="mt-4 flex justify-center space-x-2">
                            {Array.from({ length: data?.totalPages || 1 }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? 'default' : 'outline'}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                    </>
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
                                    onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter document title"
                                />
                            </div>
                            <div>
                                <label htmlFor="documentCategory" className="block text-sm font-medium text-gray-700">
                                    Category
                                </label>
                                <Select onValueChange={(value: string) => setNewDocument(prev => ({ ...prev, category: value }))}>
                                    <SelectTrigger id="documentCategory">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="finance">Finance</SelectItem>
                                        <SelectItem value="hr">HR</SelectItem>
                                        <SelectItem value="marketing">Marketing</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="documentAuthor" className="block text-sm font-medium text-gray-700">
                                    Author
                                </label>
                                <Input
                                    id="documentAuthor"
                                    value={newDocument.author}
                                    onChange={(e) => setNewDocument(prev => ({ ...prev, author: e.target.value }))}
                                    placeholder="Enter author name"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateDocument} disabled={!newDocument.title.trim() || !newDocument.category}>
                                Create
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    )
}
