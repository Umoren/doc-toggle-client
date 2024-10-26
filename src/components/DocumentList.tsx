// src/components/DocumentList.tsx

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface DocumentListProps {
    documents: Document[];
    onCreateDocument: () => void;
    onEditDocument: (document: Document) => void;
    onDeleteDocument: (id: string) => void;
    onSort: (key: keyof Document) => void;
    onFilter: (key: keyof Document, value: string) => void;
    onShareDocument: (id: string) => void;
}

export default function DocumentList({
    documents,
    onCreateDocument,
    onEditDocument,
    onDeleteDocument,
    onShareDocument,
    onSort,
    onFilter,
}: DocumentListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const { ability } = useApp();

    const filteredDocuments = documents.filter((doc) =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                </div>
                <Can I="create" a="Document" ability={ability}>
                    <Button onClick={onCreateDocument}>
                        <Plus className="mr-2 h-4 w-4" /> Create Document
                    </Button>
                </Can>
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
                                <Badge variant="secondary">
                                    {document.category || 'Uncategorized'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {format(document.lastModified, 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>{document.author || 'Unknown'}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        document.status === 'published' ? 'default' : 'outline'
                                    }
                                >
                                    {document.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>

                                        <Can I="update" this={document} ability={ability}>
                                            <DropdownMenuItem onClick={() => onEditDocument(document)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                        </Can>

                                        <Can I="delete" this={document} ability={ability}>
                                            <DropdownMenuItem
                                                onClick={() => onDeleteDocument(document.id)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </Can>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {filteredDocuments.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                    No documents found
                </div>
            )}
        </div>
    );
}
