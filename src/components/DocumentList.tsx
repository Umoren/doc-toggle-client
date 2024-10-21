import React, { useState, useMemo, useCallback } from 'react'
import { format } from 'date-fns'
import { Edit, Trash2, Share2, Plus, Search, Filter } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useApp } from '@/context/AppContext'
import { permitState } from 'permit-fe-sdk'

type Document = {
    id: string
    title: string
    category: string
    lastModified: Date
    author: string
    status: 'draft' | 'published'
}

interface DocumentListProps {
    documents: Document[]
    onCreateDocument: () => void
    onEditDocument: (id: string) => void
    onDeleteDocument: (id: string) => void
    onShareDocument: (id: string) => void
    onSort: (key: 'title' | 'category' | 'lastModified') => void
    onFilter: (key: 'category' | 'status', value: string) => void
}

const categoryColors: Record<string, string> = {
    Finance: 'bg-green-100 text-green-800',
    HR: 'bg-blue-100 text-blue-800',
    Marketing: 'bg-purple-100 text-purple-800',
}

export default function DocumentList({
    documents,
    onCreateDocument,
    onEditDocument,
    onDeleteDocument,
    onShareDocument,
    onSort,
    onFilter
}: DocumentListProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const { userId } = useApp()

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc =>
            doc.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [documents, searchTerm])

    const checkPermission = useCallback((action: string, resource: string) => {
        return permitState.check(action, resource, { userId }, {})
    }, [userId])

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search documents"
                            className="pl-8 w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select onValueChange={(value: string) => onFilter('category', value)}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Categories</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="HR">HR</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select onValueChange={(value: string) => onFilter('status', value)}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Statuses</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {checkPermission('create', 'Document') && (
                    <Button onClick={onCreateDocument} className="bg-primary text-primary-foreground">
                        <Plus className="mr-2 h-4 w-4" /> Create Document
                    </Button>
                )}
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[300px]">
                            <Button variant="ghost" onClick={() => onSort('title')}>
                                Title
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button variant="ghost" onClick={() => onSort('category')}>
                                Category
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button variant="ghost" onClick={() => onSort('lastModified')}>
                                Last Modified
                            </Button>
                        </TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredDocuments.map((document) => (
                        <TableRow key={document.id}>
                            <TableCell className="font-medium">{document.title}</TableCell>
                            <TableCell>
                                <Badge variant="secondary" className={categoryColors[document.category]}>
                                    {document.category}
                                </Badge>
                            </TableCell>
                            <TableCell>{format(document.lastModified, 'MMM d, yyyy')}</TableCell>
                            <TableCell>{document.author}</TableCell>
                            <TableCell>
                                <Badge variant={document.status === 'published' ? 'default' : 'outline'}>
                                    {document.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <Filter className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        {checkPermission('update', 'Document') && (
                                            <DropdownMenuItem onClick={() => onEditDocument(document.id)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                        )}
                                        {checkPermission('share', 'Document') && (
                                            <DropdownMenuItem onClick={() => onShareDocument(document.id)}>
                                                <Share2 className="mr-2 h-4 w-4" /> Share
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        {checkPermission('delete', 'Document') && (
                                            <DropdownMenuItem onClick={() => onDeleteDocument(document.id)} className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {filteredDocuments.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">No documents found</div>
            )}
        </div>
    )
}