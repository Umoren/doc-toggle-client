import { useState } from 'react'
import { format } from 'date-fns'
import { Search, Plus, Edit, AlertTriangle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

// Mock data and types (replace with actual data fetching and types)
type User = {
    id: string
    name: string
    email: string
    role: string
    lastLogin: Date
    status: 'active' | 'inactive'
}

type Role = {
    id: string
    name: string
    description: string
    permissions: string[]
    userCount: number
}

const mockUsers: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', lastLogin: new Date('2024-01-15'), status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', lastLogin: new Date('2024-01-10'), status: 'active' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'Viewer', lastLogin: new Date('2023-12-20'), status: 'inactive' },
]

const mockRoles: Role[] = [
    { id: '1', name: 'Admin', description: 'Full access to all features', permissions: ['create', 'read', 'update', 'delete'], userCount: 1 },
    { id: '2', name: 'Editor', description: 'Can edit and publish documents', permissions: ['read', 'update'], userCount: 1 },
    { id: '3', name: 'Viewer', description: 'Can only view documents', permissions: ['read'], userCount: 1 },
]

export default function RoleManagement() {
    const [users, setUsers] = useState<User[]>(mockUsers)
    const [roles, setRoles] = useState<Role[]>(mockRoles)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [actionToConfirm, setActionToConfirm] = useState<{ type: string; payload: any } | null>(null)

    const itemsPerPage = 10

    const filteredUsers = users.filter(user =>
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!roleFilter || user.role === roleFilter) &&
        (!statusFilter || user.status === statusFilter)
    )

    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const pageCount = Math.ceil(filteredUsers.length / itemsPerPage)

    const handleCreateRole = () => {
        // Implement role creation logic
        console.log('Create new role')
    }

    const handleEditRole = (roleId: string) => {
        // Implement role editing logic
        console.log('Edit role', roleId)
    }

    const handleChangeUserRole = (userId: string, newRole: string) => {
        setActionToConfirm({ type: 'changeRole', payload: { userId, newRole } })
        setShowConfirmDialog(true)
    }

    const confirmAction = () => {
        if (actionToConfirm) {
            if (actionToConfirm.type === 'changeRole') {
                const { userId, newRole } = actionToConfirm.payload
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, role: newRole } : user
                ))
                toast({
                    title: "Role Updated",
                    description: "The user's role has been successfully updated.",
                })
            }
            // Add other action types here if needed
        }
        setShowConfirmDialog(false)
        setActionToConfirm(null)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Role Management</h1>

            {/* User Management Section */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search users"
                                className="pl-8 w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={roleFilter || ''} onValueChange={(value: string | null) => setRoleFilter(value || null)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Roles</SelectItem>
                                {roles.map(role => (
                                    <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter || ''} onValueChange={(value: string | null) => setStatusFilter(value || null)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>{format(user.lastLogin, 'MMM d, yyyy')}</TableCell>
                                <TableCell>
                                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                                        {user.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Select onValueChange={(value: string) => handleChangeUserRole(user.id, value)}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Change Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map(role => (
                                                <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {pageCount > 1 && (
                    <div className="flex justify-center mt-4 space-x-2">
                        {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
                            <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Role Management Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Roles</h2>
                    <Button onClick={handleCreateRole}>
                        <Plus className="mr-2 h-4 w-4" /> Create New Role
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {roles.map(role => (
                        <Card key={role.id}>
                            <CardHeader>
                                <CardTitle>{role.name}</CardTitle>
                                <CardDescription>{role.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm mb-2">Permissions:</p>
                                <div className="flex flex-wrap gap-2">
                                    {role.permissions.map(permission => (
                                        <Badge key={permission} variant="secondary">{permission}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <p className="text-sm text-muted-foreground">Users: {role.userCount}</p>
                                <Button variant="outline" size="sm" onClick={() => handleEditRole(role.id)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit Role
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Action</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to perform this action? This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
                        <Button onClick={confirmAction}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
