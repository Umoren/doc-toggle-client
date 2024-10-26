import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Users, FolderOpen } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Can } from '@casl/react';

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
  const [userFullName, setUserFullName] = useState<string | null>(null);

  const { ability, userId } = useApp();

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

        // Fetch user data to get full name
        const userResponse = await apiClient.get(`/api/policies/users/${userId}`, {
          headers: {
            'user-id': userId,
          },
        });

        const userData = userResponse.data;

        // Set user's full name if available
        const fullName = `${userData.first_name} ${userData.last_name}`.trim();
        setUserFullName(fullName || userData.email); // Fallback to email if name is not available
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  // Render a personalized message based on abilities
  const renderAbilityMessage = () => {
    if (!ability) {
      return 'Loading permissions...';
    }

    if (ability.can('manage', 'all')) {
      return 'You have full access to manage all resources.';
    } else if (ability.can('manage', 'Category')) {
      return 'You can manage categories.';
    } else if (ability.can('manage', 'Document')) {
      return 'You can manage documents.';
    } else if (ability.can('read', 'Category') || ability.can('read', 'Document')) {
      return 'You have read-only access to categories and documents.';
    }
    return 'You have limited access.';
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">
          Welcome to Document Manager{userFullName ? `, ${userFullName}` : ''}
        </h1>

        {/* Ability Info */}
        <div className="mb-6">
          <p className="text-xl">{renderAbilityMessage()}</p>
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
          {ability && ability.can('create', 'Category') && (
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create New Category
            </Button>
          )}
          {ability && ability.can('create', 'Document') && (
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create New Document
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
