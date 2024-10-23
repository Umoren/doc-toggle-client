import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import apiClient from '@/lib/api';
import Layout from '../components/Layout';
import CategoryList from '../components/CategoryList';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useApp } from '@/context/AppContext';

interface Category {
    id: string;
    name: string;
    description?: string;
}

const fetchCategories = async (): Promise<Category[]> => {
    const response = await apiClient.get('/api/policies/categories');

    // Map the response data to the expected Category type
    return response.data.map((category: any) => ({
        id: category.id,
        name: category.key,  // Map 'key' to 'name'// Handle missing descriptions
    }));
};

const createCategory = async (category: Omit<Category, 'id'>, userId: string): Promise<Category> => {
    if (!userId) {
        throw new Error("User ID is not available");
    }

    const response = await apiClient.post('/api/policies/categories', category, {
        headers: {
            'user-id': userId
        }
    });
    return response.data;
};

const deleteCategory = async (id: string, userId: string): Promise<void> => {
    if (!userId) {
        throw new Error("User ID is not available");
    }

    const instanceKey = `Category:${id}`; // Use the instance key format

    await apiClient.delete(`/api/policies/categories/${instanceKey}`, {
        headers: {
            'user-id': userId
        }
    });
};

export default function CategoriesPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDescription, setNewCategoryDescription] = useState('');
    const { toast } = useToast();
    const { userId } = useApp();
    const queryClient = useQueryClient();

    const { data: categories, isLoading, error } = useQuery('categories', fetchCategories);

    const createMutation = useMutation(
        (category: Omit<Category, 'id'>) => createCategory(category, userId!),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('categories');
                setIsCreateDialogOpen(false);
                resetForm();
                toast({ title: "Category Created", description: "The new category has been successfully created." });
            }
        }
    );

    const deleteMutation = useMutation(
        (id: string) => deleteCategory(id, userId!),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('categories');
                toast({ title: "Category Deleted", description: "The category has been successfully deleted." });
            }
        }
    );

    const resetForm = () => {
        setNewCategoryName('');
        setNewCategoryDescription('');
    };

    const handleCreateCategory = () => {
        createMutation.mutate({ name: newCategoryName, description: newCategoryDescription });
    };

    const handleDeleteCategory = (id: string) => {
        deleteMutation.mutate(id);
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>An error occurred: {error instanceof Error ? error.message : 'Unknown error'}</div>;

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6">Categories</h1>

            <CategoryList
                categories={categories || []}
                onCreateCategory={() => setIsCreateDialogOpen(true)}
                onDeleteCategory={handleDeleteCategory}
            />

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
                        <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim()}>
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Layout>
    );
}
