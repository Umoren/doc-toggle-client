import React, { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import { Home, ChevronRight, Plus } from 'lucide-react'
import Layout from '@/components/Layout'
import DocumentList from '@/components/DocumentList'
import { Document } from '@/types/document'
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
    documents: Omit<Document, 'lastModified'>[]
    totalPages: number
}

// API Functions
const fetchDocuments = async ({ pageParam = 1, filters = {}, sort = {} }: FetchDocumentsParams): Promise<FetchDocumentsResponse> => {
    const response = await axios.get('/api/policies/documents', {
        params: { page: pageParam, ...filters, ...sort }
    })
    return response.data
}

const createDocument = async (document: Omit<Document, 'id'>): Promise<Document> => {
    const response = await axios.post('/api/policies/documents', document)
    return response.data
}

const updateDocument = async (document: Document): Promise<Document> => {
    const response = await axios.put(`/api/policies/documents/${document.id}`, document)
    return response.data
}

const deleteDocument = async (id: string): Promise<void> => {
    await axios.delete(`/api/policies/documents/${id}`)
}

// Main Component
export default function DocumentsPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [newDocument, setNewDocument] = useState<Omit<Document, 'id'>>({
        title: '',
        category: '',
        lastModified: new Date().toISOString(),
        author: '',
        status: 'draft'
    })
    const [currentPage, setCurrentPage] = useState(1)
    const [filters, setFilters] = useState<Record<string, string>>({})
    const [sort, setSort] = useState<Record<string, 'asc' | 'desc'>>({})

    const { userId } = useApp()
    const { toast } = useToast()
    const queryClient = useQueryClient()

    // Queries and Mutations
    const { data, isLoading, error } = useQuery<FetchDocumentsResponse, Error>(
        ['documents', currentPage, filters, sort],
        () => fetchDocuments({ pageParam: currentPage, filters, sort }),
        {
            keepPreviousData: true,
            select: (data) => ({
                ...data,
                documents: data.documents.map(doc => ({
                    ...doc,
                    lastModified: new Date(doc.lastModified)
                }))
            })
        }
    )

    const createMutation = useMutation(createDocument, {
        onSuccess: () => {
            queryClient.invalidateQueries('documents')
            setIsCreateDialogOpen(false)
            setNewDocument({ title: '', category: '', lastModified: new Date().toISOString(), author: '', status: 'draft' })
            toast({
                title: "Document Created",
                description: "The new document has been successfully created.",
            })
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: `Failed to create document: ${error.message}`,
                variant: "destructive",
            })
        },
    })

    const updateMutation = useMutation(updateDocument, {
        onSuccess: () => {
            queryClient.invalidateQueries('documents')
            toast({
                title: "Document Updated",
                description: "The document has been successfully updated.",
            })
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: `Failed to update document: ${error.message}`,
                variant: "destructive",
            })
        },
    })

    const deleteMutation = useMutation(deleteDocument, {
        onSuccess: () => {
            queryClient.invalidateQueries('documents')
            toast({
                title: "Document Deleted",
                description: "The document has been successfully deleted.",
            })
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: `Failed to delete document: ${error.message}`,
                variant: "destructive",
            })
        },
    })

    // Handlers
    const handleCreateDocument = useCallback(() => {
        if (permitState.check('create', 'Document', { userId }, {})) {
            createMutation.mutate(newDocument)
        } else {
            toast({
                title: "Permission Denied",
                description: "You don't have permission to create documents.",
                variant: "destructive",
            })
        }
    }, [userId, newDocument, createMutation, toast])

    const handleUpdateDocument = useCallback((document: Document) => {
        if (permitState.check('update', 'Document', { userId }, {})) {
            updateMutation.mutate(document)
        } else {
            toast({
                title: "Permission Denied",
                description: "You don't have permission to update documents.",
                variant: "destructive",
            })
        }
    }, [userId, updateMutation, toast])

    const handleDeleteDocument = useCallback((id: string) => {
        if (permitState.check('delete', 'Document', { userId }, {})) {
            deleteMutation.mutate(id)
        } else {
            toast({
                title: "Permission Denied",
                description: "You don't have permission to delete documents.",
                variant: "destructive",
            })
        }
    }, [userId, deleteMutation, toast])

    const handleFilter = useCallback((key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setCurrentPage(1)
    }, [])

    const handleSort = useCallback((key: string) => {
        setSort(prev => ({ [key]: prev[key] === 'asc' ? 'desc' : 'asc' }))
        setCurrentPage(1)
    }, [])

    // Render
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
                    {permitState.check('create', 'Document', { userId }, {}) && (
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Create Document
                        </Button>
                    )}
                </div>

                {isLoading ? (
                    <div className="text-center py-10">Loading documents...</div>
                ) : error ? (
                    <div className="text-center py-10 text-red-500">Error loading documents: {error.message}</div>
                ) : (
                    <>
                        <DocumentList
                            documents={data?.documents || []}
                            onCreateDocument={() => setIsCreateDialogOpen(true)}
                            onEditDocument={handleUpdateDocument}
                            onDeleteDocument={handleDeleteDocument}
                            onShareDocument={() => { }} // Implement share functionality if needed
                            onSort={handleSort}
                            onFilter={handleFilter}
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
                                <Select onValueChange={(value) => setNewDocument(prev => ({ ...prev, category: value }))}>
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
