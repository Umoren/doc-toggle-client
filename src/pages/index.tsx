import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import Layout from '../components/Layout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Users, FolderOpen } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface Category {
  id: string;
}

interface Document {
  id: string;
}

interface User {
  id: string;
}

export default function Home() {
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [canCreateCategory, setCanCreateCategory] = useState(false);
  const [canCreateDocument, setCanCreateDocument] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userFullName, setUserFullName] = useState<string | null>(null);

  const { checkPermission, userId } = useApp();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) {
          return;
        }

        // Fetch basic info: categories, documents, users
        const categoriesResponse = await apiClient.get<Category[]>('/api/policies/categories');
        setTotalCategories(categoriesResponse.data.length);

        const documentsResponse = await apiClient.get<Document[]>('/api/policies/documents');
        setTotalDocuments(documentsResponse.data.length);

        const usersResponse = await apiClient.get<User[]>('/api/policies/users', {
          headers: {
            'user-id': userId,
          },
        });
        setTotalUsers(usersResponse.data.length);

        // Fetch user roles and other info from the user object
        const userResponse = await apiClient.get(`/api/policies/users/${userId}`, {
          headers: {
            'user-id': userId,
          },
        });

        const userData = userResponse.data;
        const roles = userData.roles.map((roleObj: any) => roleObj.role);
        setUserRoles(roles);

        // Set user's full name if available
        const fullName = `${userData.first_name} ${userData.last_name}`.trim();
        setUserFullName(fullName || userData.email); // Fallback to email if name is not available

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchPermissions = async () => {
      const canCreateCategory = await checkPermission('create', 'Category', 'some_category_id');
      const canCreateDocument = await checkPermission('create', 'Document', 'some_document_id');
      setCanCreateCategory(canCreateCategory);
      setCanCreateDocument(canCreateDocument);
    };

    if (userId) {
      fetchData();
      fetchPermissions();
    }
  }, [userId, checkPermission]);

  // Renders a personalized message based on the user's roles
  const renderRoleMessage = () => {
    if (userRoles.includes('SuperAdmin')) {
      return "You have full access to manage all resources.";
    } else if (userRoles.includes('CategoryOwner')) {
      return "You can manage categories and assign documents.";
    } else if (userRoles.includes('DocumentOwner')) {
      return "You can create, edit, and delete documents.";
    } else if (userRoles.includes('Viewer')) {
      return "You have view-only access to categories and documents.";
    }
    return "No specific roles assigned.";
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">Welcome to Document Manager, {userFullName || 'User'}</h1>

        {/* Role Info */}
        <div className="mb-6">
          <p className="text-xl">{renderRoleMessage()}</p>
        </div>

        {/* Summary Statistics */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCategories}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDocuments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex space-x-4 mb-8">
          {canCreateCategory && (
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create New Category
            </Button>
          )}
          {canCreateDocument && (
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create New Document
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
