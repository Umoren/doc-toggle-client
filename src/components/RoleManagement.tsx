import { useState } from 'react';
import { format } from 'date-fns';
import { Search, Plus, Edit } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiClient from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import CreateRoleDialog from './CreateRoleDialog';

// Define the types for User and Role as per your requirements
type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    lastLogin: Date;
    status: 'active' | 'inactive';
};

type Role = {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    // userCount: number;
};

interface RoleManagementProps {
    users: User[];
    roles: Role[];
    onUpdateUserRole: (userId: string, roleId: string) => void;
    onUpdateRole: (role: Role) => void;
    onDeleteRole: (id: string) => void;
}


export default function RoleManagement({ users, roles, onUpdateUserRole, onUpdateRole, onDeleteRole }: RoleManagementProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState<{ type: string; payload: any } | null>(null);
    const [selectedResourceType, setSelectedResourceType] = useState<string | null>(null);
    const [selectedResourceKey, setSelectedResourceKey] = useState<string | null>(null);

    const itemsPerPage = 10;

    const filteredUsers = users.filter((user: User) =>
        ((user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!roleFilter || user.role === roleFilter) &&
        (!statusFilter || user.status === statusFilter)
    );


    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const pageCount = Math.ceil(filteredUsers.length / itemsPerPage);

    const handleCreateRole = () => {
        // Trigger role creation
        setIsCreateRoleDialogOpen(true)
    };

    const handleCreateRoleSubmit = async (name: string, description: string, permissions: string[]) => {
        const rolePayload = {
            key: name.toLowerCase().replace(/\s+/g, '_'),
            name,
            description,
            permissions,
            extends: []
        };

        try {
            const response = await apiClient.post('/api/policies/create-role', rolePayload); // Assuming this is your backend route for creating a role
            const newRole = response.data.role; // Assuming the response includes the created role with an 'id'

            onUpdateRole(newRole); // Updating role state or triggering re-fetch of roles
            toast({
                title: "Role Created",
                description: `The role "${newRole.name}" has been created successfully.`,
            });
        } catch (error) {
            console.error('Error creating role:', error);
            toast({
                title: "Error",
                description: "Failed to create the role.",
            });
        }
    };


    const handleEditRole = (role: Role) => {
        // Trigger role editing
        onUpdateRole(role);
    };


    const handleChangeUserRole = (userId: string, newRole: string) => {
        setActionToConfirm({
            type: 'changeRole',
            payload: {
                userId,
                newRole,
                resourceType: selectedResourceType,
                resourceKey: selectedResourceKey
            }
        });
        setShowConfirmDialog(true);
    };

    const confirmAction = async () => {
        if (actionToConfirm?.type === 'changeRole') {
            const { userId, newRole, resourceType, resourceKey } = actionToConfirm.payload;

            const payload = {
                userId,
                roleKey: newRole,
                resourceType, // Dynamically set resourceType
                resourceKey,  // Dynamically set resourceKey
                tenant: "default"
            };

            try {
                const response = await apiClient.post('/api/policies/assign-role', payload, {
                    headers: {
                        'user-id': userId
                    }
                });
                if (response.status === 200) {
                    toast({
                        title: "Role Updated",
                        description: "The user's role has been successfully updated.",
                    });
                } else {
                    throw new Error("Role update failed");
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to update the user's role.",
                });
                console.error("Error assigning role:", error);
            }

            setShowConfirmDialog(false);
            setActionToConfirm(null);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">

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

                        <div className="relative">
                            <select
                                className="block w-40 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={roleFilter || ''}
                                onChange={(e) => setRoleFilter(e.target.value || null)}
                            >
                                <option value="">All Roles</option>
                                {roles.map((role: Role) => (
                                    <option key={role.id} value={role.name || `role-${role.id}`}>
                                        {role.name || 'Unnamed Role'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <select
                                className="block w-40 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={statusFilter || ''}
                                onChange={(e) => setStatusFilter(e.target.value || null)}
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
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
                        {paginatedUsers.map((user: User) => (
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
                                    <TableCell>
                                        <Select onValueChange={(value: string) => handleChangeUserRole(user.id, value)}>
                                            <SelectTrigger className="w-32">
                                                <SelectValue placeholder="Select Role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((role: Role) => (
                                                    <SelectItem key={role.id} value={role.name ? role.name : `role-${role.id}`}>
                                                        {role.name || 'Unnamed Role'}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                    </TableCell>
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
                    {roles.map((role: Role) => (
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
                                {/* <p className="text-sm text-muted-foreground">Users: {role.userCount}</p> */}
                                <Button variant="outline" size="sm" onClick={() => handleEditRole(role)}>
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
                        <DialogTitle>Confirm Role Assignment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to assign this role? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
                        <Button onClick={confirmAction}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            <CreateRoleDialog
                open={isCreateRoleDialogOpen} // Correct prop: open (not 'on')
                onOpenChange={setIsCreateRoleDialogOpen} // Correct handler for opening and closing dialog
                onCreateRole={handleCreateRoleSubmit} // The function to handle role creation
            />

        </div>
    );
}
