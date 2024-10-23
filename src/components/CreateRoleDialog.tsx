import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateRoleDialogProps {
    open: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onCreateRole: (name: string, description: string, permissions: string[]) => void; // Callback to create role
}

export default function CreateRoleDialog({ open, onOpenChange, onCreateRole }: CreateRoleDialogProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [permissions, setPermissions] = useState<string[]>([]); // Permissions can be updated dynamically

    const handleCreate = () => {
        onCreateRole(name, description, permissions); // Callback to the parent
        setName('');
        setDescription('');
        setPermissions([]);
        onOpenChange(false); // Close dialog after creation
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Role</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Role Name"
                    />
                    <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Role Description"
                    />
                    {/* Add a dropdown or checkbox for selecting permissions */}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={!name.trim() || !description.trim()}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
