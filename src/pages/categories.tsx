import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import apiClient from '@/lib/api';
import Layout from '@/components/Layout';
import CategoryList from '@/components/CategoryList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/context/AppContext';
import { Can } from '@casl/react';

interface Category {
    id: string;
    name: string;
    description?: string;
}

const fetchCategories = async (): Promise<Category[]> => {
    const response = await apiClient.get('/api/policies/categories');
    return response.data.map((category: any) => ({
        id: category.key, // Assuming 'key' is used as 'id'
        name: category.key,
        description: category.description || '',
    }));
};

const createCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
    const response = await apiClient.post('/api/policies/categories', category);
    return response.data;
};

const deleteCategory = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/policies/categories/${id}`);
};

export default function CategoriesPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDescription, setNewCategoryDescription] = useState('');
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { ability } = useApp();

    const { data: categories, isLoading, error } = useQuery('categories', fetchCategories);

    const createMutation = useMutation(createCategory, {
        onSuccess: () => {
            queryClient.invalidateQueries('categories');
            setIsCreateDialogOpen(false);
            setNewCategoryName('');
            setNewCategoryDescription('');
            toast({ title: 'Category Created', description: 'The new category has been successfully created.' });
        },
        onError: () => {
            toast({ title: 'Error', description: 'Failed to create category.', variant: 'destructive' });
        },
    });

    const deleteMutation = useMutation(deleteCategory, {
        onSuccess: () => {
            queryClient.invalidateQueries('categories');
            toast({ title: 'Category Deleted', description: 'The category has been successfully deleted.' });
        },
        onError: () => {
            toast({ title: 'Error', description: 'Failed to delete category.', variant: 'destructive' });
        },
    });

    const handleCreateCategory = () => {
        createMutation.mutate({ name: newCategoryName, description: newCategoryDescription });
    };

    const handleDeleteCategory = (id: string) => {
        deleteMutation.mutate(id);
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Categories</h1>

                {isLoading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div>An error occurred: {error instanceof Error ? error.message : 'Unknown error'}</div>
                ) : (
                    <CategoryList
                        categories={categories || []}
                        onCreateCategory={() => setIsCreateDialogOpen(true)}
                        onDeleteCategory={handleDeleteCategory}
                    />
                )}

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Category</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Enter category name"
                            />
                            <Input
                                value={newCategoryDescription}
                                onChange={(e) => setNewCategoryDescription(e.target.value)}
                                placeholder="Enter category description (optional)"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Can I="create" a="Category" ability={ability}>
                                <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim()}>
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
