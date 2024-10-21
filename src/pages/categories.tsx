import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import Layout from '../components/Layout'
import CategoryList from '../components/CategoryList'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useApp } from '@/context/AppContext'

interface Category {
    id: string
    name: string
    description?: string
}

const fetchCategories = async (): Promise<Category[]> => {
    const response = await axios.get('/api/policies/categories')
    return response.data
}

const createCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
    const response = await axios.post('/api/policies/categories', category)
    return response.data
}

const updateCategory = async (category: Category): Promise<Category> => {
    const response = await axios.put(`/api/policies/categories/${category.id}`, category)
    return response.data
}

const deleteCategory = async (id: string): Promise<void> => {
    await axios.delete(`/api/policies/categories/${id}`)
}

export default function CategoriesPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [newCategoryDescription, setNewCategoryDescription] = useState('')
    const { ability } = useApp()
    const { toast } = useToast()

    const queryClient = useQueryClient()

    const { data: categories, isLoading, error } = useQuery('categories', fetchCategories)

    const createMutation = useMutation(createCategory, {
        onSuccess: () => {
            queryClient.invalidateQueries('categories')
            setIsCreateDialogOpen(false)
            setNewCategoryName('')
            setNewCategoryDescription('')
            toast({ title: "Category Created", description: "The new category has been successfully created." })
        },
    })

    const updateMutation = useMutation(updateCategory, {
        onSuccess: () => {
            queryClient.invalidateQueries('categories')
            toast({ title: "Category Updated", description: "The category has been successfully updated." })
        },
    })

    const deleteMutation = useMutation(deleteCategory, {
        onSuccess: () => {
            queryClient.invalidateQueries('categories')
            toast({ title: "Category Deleted", description: "The category has been successfully deleted." })
        },
    })

    const handleCreateCategory = () => {
        createMutation.mutate({ name: newCategoryName, description: newCategoryDescription })
    }

    const handleEditCategory = (id: string) => {
        // Implement edit functionality
    }

    const handleDeleteCategory = (id: string) => {
        deleteMutation.mutate(id)
    }

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>An error occurred: {error instanceof Error ? error.message : 'Unknown error'}</div>

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6">Categories</h1>

            <CategoryList
                categories={categories || []}
                onCreateCategory={() => setIsCreateDialogOpen(true)}
                onEditCategory={handleEditCategory}
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
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim()}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Layout>
    )
}