import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from '@/context/AppContext';

type Category = {
    id: string;
    name: string;
    description?: string;
}

interface CategoryListProps {
    categories: Category[];
    onCreateCategory: () => void;
    onDeleteCategory: (id: string) => void;
}

export default function CategoryList({ categories, onCreateCategory, onDeleteCategory }: CategoryListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const { checkPermission, userId } = useApp();

    const [permissions, setPermissions] = useState<{
        canCreate: boolean;
        canUpdate: Record<string, boolean>;
        canDelete: Record<string, boolean>;
    }>({
        canCreate: false,
        canUpdate: {},
        canDelete: {},
    });

    const filteredCategories = categories.filter(category =>
        (category.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );


    useEffect(() => {
        const fetchPermissions = async () => {
            const canCreate = await checkPermission('create', 'Category', 'some_category_id');

            const canUpdate: Record<string, boolean> = {};
            const canDelete: Record<string, boolean> = {};

            for (const category of categories) {
                canUpdate[category.id] = await checkPermission('update', 'Category', category.id);
                canDelete[category.id] = await checkPermission('delete', 'Category', category.id);
            }

            setPermissions({
                canCreate,
                canUpdate,
                canDelete,
            });
        };

        if (userId && categories.length) {
            fetchPermissions();
        }
    }, [userId, categories, checkPermission]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search categories"
                        className="pl-8"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                {permissions.canCreate && (
                    <Button onClick={onCreateCategory} className="bg-primary text-primary-foreground">
                        <Plus className="mr-2 h-4 w-4" /> Create Category
                    </Button>
                )}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCategories.map(category => (
                    <Card key={category.id}>
                        <CardHeader>
                            <CardTitle>{category.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2">

                            {permissions.canDelete[category.id] && (
                                <Button variant="outline" size="sm" onClick={() => onDeleteCategory(category.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
