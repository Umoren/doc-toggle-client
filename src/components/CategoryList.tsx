import React, { useState } from 'react'
import { Search, Edit, Trash2, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useApp } from '@/context/AppContext'
import { permitState } from 'permit-fe-sdk'

type Category = {
    id: string
    name: string
    description?: string
}

interface CategoryListProps {
    categories: Category[]
    onCreateCategory: () => void
    onEditCategory: (id: string) => void
    onDeleteCategory: (id: string) => void
}

export default function CategoryList({ categories, onCreateCategory, onEditCategory, onDeleteCategory }: CategoryListProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const { userId } = useApp()

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    const checkPermission = (action: string, resource: string) => {
        return permitState.check(action, resource, { userId }, {})
    }

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
                {checkPermission('create', 'Category') && (
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
                            {checkPermission('update', 'Category') && (
                                <Button variant="outline" size="sm" onClick={() => onEditCategory(category.id)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                            )}
                            {checkPermission('delete', 'Category') && (
                                <Button variant="outline" size="sm" onClick={() => onDeleteCategory(category.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}