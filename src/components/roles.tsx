import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import apiClient from '@/lib/api'
import Layout from '../components/Layout'
import RoleManagement from '../components/RoleManagement'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb"
import { Home, ChevronRight } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useApp } from '@/context/AppContext'

// Types
interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    lastLogin: Date; // Ensure this matches the type in RoleManagement.tsx
    status: 'active' | 'inactive';
    created_at: Date;
}

interface Role {
    id: string
    name: string
    description: string
    permissions: string[]
}

const fetchUsersFromAPI = async (userId: string | null): Promise<User[]> => {
    if (!userId) {
        return []; // Return an empty array if userId is null or undefined
    }
    const response = await apiClient.get('/api/policies/users', {
        headers: {
            'user-id': userId
        }
    });

    // Access the `data` field within the response object
    const users = response.data?.data;

    if (!Array.isArray(users)) {
        return []; // Ensure users is an array before proceeding
    }

    return users.map((user: User) => ({
        ...user,
        lastLogin: new Date(user.created_at), // Convert string to Date (replace `lastLogin` with `created_at`)
    }));
};

const fetchRolesFromAPI = async (userId: string | null): Promise<Role[]> => {
    if (!userId) {
        return []; // Return an empty array if userId is null or undefined
    }
    const response = await apiClient.get('/api/policies/list-roles', {
        headers: {
            'user-id': userId
        }
    });
    return response.data;
};

const updateUserRole = async ({ userId, roleId }: { userId: string; roleId: string }, currentUserId: string): Promise<User> => {
    const response = await apiClient.post(`/api/policies/users/${userId}/assign-role`, { roleId }, {
        headers: {
            'user-id': currentUserId
        }
    });
    return response.data;
};

const createRole = async (role: Omit<Role, 'id'>, userId: string): Promise<Role> => {
    if (!userId) {
        throw new Error('User ID is required to create a role');
    }
    const response = await apiClient.post('/api/policies/create-role', role, {
        headers: {
            'user-id': userId
        }
    });
    return response.data;
};

const updateRole = async (role: Role, userId: string): Promise<Role> => {
    if (!userId) {
        throw new Error('User ID is required to update a role');
    }
    const response = await apiClient.put(`/api/policies/update-role/${role.id}`, role, {
        headers: {
            'user-id': userId
        }
    });
    return response.data;
};

const deleteRole = async (id: string, userId: string): Promise<void> => {
    await apiClient.delete(`/api/policies/delete-role/${id}`, {
        headers: {
            'user-id': userId
        }
    });
};

export default function RolesPage() {
    const { userId } = useApp(); // Hook should be called inside the component
    const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false)
    const [newRole, setNewRole] = useState<Omit<Role, 'id'>>({ name: '', description: '', permissions: [] })
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; action: () => void; title: string; description: string }>({
        isOpen: false,
        action: () => { },
        title: '',
        description: '',
    })

    const queryClient = useQueryClient()

    const { data: users, isLoading: isLoadingUsers, error: usersError } = useQuery('users', () => fetchUsersFromAPI(userId));
    const { data: roles, isLoading: isLoadingRoles, error: rolesError } = useQuery('roles', () => fetchRolesFromAPI(userId));

    const updateUserRoleMutation = useMutation(({ userId, roleId }: { userId: string; roleId: string }) => updateUserRole({ userId, roleId }, userId), {
        onSuccess: () => {
            queryClient.invalidateQueries('users')
            toast({
                title: "User Role Updated",
                description: "The user's role has been successfully updated.",
            })
        },
    })

    const createRoleMutation = useMutation((newRole: Omit<Role, 'id'>) => {
        if (userId) {
            return createRole(newRole, userId); // Only run if userId is available
        }
        return Promise.reject(new Error('User ID is required'));
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries('roles');
            setIsCreateRoleDialogOpen(false);
            setNewRole({ name: '', description: '', permissions: [] });
            toast({
                title: "Role Created",
                description: "The new role has been successfully created.",
            });
        },
    });

    const updateRoleMutation = useMutation((role: Role) => {
        if (userId) {
            return updateRole(role, userId); // Proceed only if userId is available
        }
        return Promise.reject(new Error('User ID is required to update the role'));
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries('roles');
            toast({
                title: "Role Updated",
                description: "The role has been successfully updated.",
            });
        },
    });

    const deleteRoleMutation = useMutation((id: string) => {
        if (userId) {
            return deleteRole(id, userId); // Proceed only if userId is available
        }
        return Promise.reject(new Error('User ID is required to delete the role'));
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries('roles');
            toast({
                title: "Role Deleted",
                description: "The role has been successfully deleted.",
            });
        },
    });


    const handleUpdateUserRole = (userId: string, roleId: string) => {
        setConfirmDialog({
            isOpen: true,
            action: () => updateUserRoleMutation.mutate({ userId, roleId }),
            title: "Confirm Role Change",
            description: "Are you sure you want to change this user's role? This action cannot be undone.",
        })
    }

    const handleCreateRole = () => {
        createRoleMutation.mutate(newRole)
    }

    const handleUpdateRole = (role: Role) => {
        updateRoleMutation.mutate(role)
    }

    const handleDeleteRole = (id: string) => {
        setConfirmDialog({
            isOpen: true,
            action: () => deleteRoleMutation.mutate(id),
            title: "Confirm Role Deletion",
            description: "Are you sure you want to delete this role? This action cannot be undone.",
        })
    }

    if (isLoadingUsers || isLoadingRoles) {
        return <Layout><div className="text-center py-10">Loading...</div></Layout>
    }

    if (usersError || rolesError) {
        return <Layout><div className="text-center py-10 text-red-500">Error loading data. Please try again later.</div></Layout>
    }

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
                        <BreadcrumbLink href="/roles">Roles</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Role Management</h1>
                    <Button onClick={() => setIsCreateRoleDialogOpen(true)}>Create New Role</Button>
                </div>

                <RoleManagement
                    users={users || []}  // Ensure users is always an array
                    roles={roles || []}
                    onUpdateUserRole={handleUpdateUserRole}
                    onUpdateRole={handleUpdateRole}
                    onDeleteRole={handleDeleteRole}
                />

                <Dialog open={isCreateRoleDialogOpen} onOpenChange={setIsCreateRoleDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Role</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="roleName" className="block text-sm font-medium text-gray-700">
                                    Role Name
                                </label>
                                <Input
                                    id="roleName"
                                    value={newRole.name}
                                    onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter role name"
                                />
                            </div>
                            <div>
                                <label htmlFor="roleDescription" className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <Input
                                    id="roleDescription"
                                    value={newRole.description}
                                    onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Enter role description"
                                />
                            </div>
                            {/* Add more fields for permissions if needed */}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateRoleDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateRole} disabled={!newRole.name.trim()}>
                                Create
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={confirmDialog.isOpen} onOpenChange={(isOpen) => setConfirmDialog(prev => ({ ...prev, isOpen }))}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
                            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => {
                                confirmDialog.action()
                                setConfirmDialog(prev => ({ ...prev, isOpen: false }))
                            }}>
                                Confirm
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Layout>
    )
}