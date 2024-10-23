import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { Edit, Trash2, Plus, Search, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from '@/context/AppContext';

type Document = {
    id: string;
    title: string;
    category: string;
    lastModified: Date;
    author: string;
    status: 'draft' | 'published';
    owner: string;
    key: string;
    created_at: Date;
};

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
    onFilter
}: DocumentListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const { checkPermission, userId, isPermitReady } = useApp();
    const [canCreateDocument, setCanCreateDocument] = useState(false);
    const [permissions, setPermissions] = useState<{ [key: string]: { canEdit: boolean; canDelete: boolean } }>({});

    useEffect(() => {
        const fetchPermissions = async () => {
            const permitted = await checkPermission('create', 'Document', 'default_document_resource'); // placeholder ID for resourceId
            setCanCreateDocument(permitted);
        };
        if (userId) {
            fetchPermissions();
        }
    }, [userId, checkPermission]);

    useEffect(() => {
        const fetchDocumentPermissions = async () => {
            const permissionResults: { [key: string]: { canEdit: boolean; canDelete: boolean } } = {};
            for (const document of documents) {
                const canEdit = await checkPermission('update', 'Document', document.id);
                const canDelete = await checkPermission('delete', 'Document', document.id);
                permissionResults[document.id] = { canEdit, canDelete };
            }
            setPermissions(permissionResults);
        };

        if (documents.length > 0 && userId) {
            fetchDocumentPermissions();
        }
    }, [documents, userId, checkPermission]);

    const filteredDocuments = useMemo(() => {
        return documents.filter((doc) =>
            doc.title.toLowerCase().includes(searchTerm.toLowerCase()) // Now correctly using `title`
        );
    }, [documents, searchTerm]);

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

                    {/* Replace shadcn select with native select */}
                    <select
                        className="w-40 border rounded-md px-2 py-1"
                        onChange={(e) => onFilter('category', e.target.value)}
                    >
                        <option value="">All Categories</option>
                        <option value="Finance">Finance</option>
                        <option value="HR">HR</option>
                        <option value="Marketing">Marketing</option>
                    </select>
                </div>
                {canCreateDocument && (
                    <Button onClick={onCreateDocument}>
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
                            <TableCell className="font-medium">{document.title}</TableCell> {/* Now using title */}
                            <TableCell>
                                <Badge variant="secondary">
                                    {document.category || "Uncategorized"} {/* Ensure category is handled */}
                                </Badge>
                            </TableCell>
                            <TableCell>{format(new Date(document.created_at), 'MMM d, yyyy')}</TableCell> {/* Use created_at */}
                            <TableCell>{document.author || "Unknown"}</TableCell> {/* Handle undefined author */}
                            <TableCell>
                                <Badge variant={document.status === 'published' ? 'default' : 'outline'}>
                                    {document.status || 'draft'}
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

                                        {/* Edit Action: Allow if user has update permission */}
                                        {permissions[document.id]?.canEdit && (
                                            <DropdownMenuItem onClick={() => onEditDocument(document)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                        )}

                                        {/* Delete Action: Allow if user has delete permission */}
                                        {permissions[document.id]?.canDelete && (
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
    );
}
