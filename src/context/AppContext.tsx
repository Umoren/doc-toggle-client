import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { createMongoAbility, AbilityBuilder, PureAbility } from '@casl/ability';
import { initPermit, permitState } from '../lib/permit';
import { useUser } from '@clerk/nextjs';

type CaslRule = {
  action: string;
  subject: string;
  inverted?: boolean;
};

interface AppContextType {
  userId: string | null;
  ability: PureAbility | null;
  isPermitReady: boolean;
  checkPermission: (action: string, resourceType: string, resourceId: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const [ability, setAbility] = useState<PureAbility | null>(null);
  const [isPermitReady, setIsPermitReady] = useState(false);

  useEffect(() => {
    const loadPermissions = async () => {
      if (!user?.id) {
        console.error('User data not loaded yet');
        return;
      }

      console.log('User ID:', user?.id);
      try {
        // Register user with required fields
        console.log('Registering user...');
        await apiClient.post(
          '/api/policies/register',
          {
            userId: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName
          },
          {
            headers: {
              'user-id': user.id
            }
          }
        );

        // Fetch available resource instances
        const resources = await apiClient.get('/api/policies/list-resource-instances', {
          headers: {
            'user-id': user.id
          }
        });

        const defaultResource = resources.data.find((resource: any) => resource.resource === 'Category');
        if (!defaultResource) {
          console.error('No default Category resource found');
          return;
        }

        await apiClient.post(
          '/api/policies/assign-role',
          {
            userId: user.id,
            roleKey: 'Viewer',
            resourceType: 'Category',
            resourceKey: defaultResource.key,
            tenant: defaultResource.tenant
          },
          {
            headers: {
              'user-id': user.id
            }
          }
        );

        const permit = initPermit(user.id);

        await permit.loadLocalStateBulk([
          { action: 'create', resource: 'Category' },
          { action: 'read', resource: 'Category' },
          { action: 'update', resource: 'Category' },
          { action: 'delete', resource: 'Category' },
          { action: 'create', resource: 'Document' },
          { action: 'read', resource: 'Document' },
          { action: 'update', resource: 'Document' },
          { action: 'delete', resource: 'Document' }
        ]);

        const caslRules = permitState.getCaslJson() as CaslRule[];
        if (!caslRules || caslRules.length === 0) {
          console.error('No CASL rules returned from Permit');
        }
        console.log('CASL rules:', caslRules);

        const { can, build } = new AbilityBuilder(createMongoAbility);

        caslRules.forEach((rule) => {
          console.log(`Processing rule for ${rule.subject}:`, rule);
          can(rule.action, rule.subject);  // Removed `conditions` since it doesn't exist
        });

        setAbility(build());
        console.log('CASL ability set successfully');

        setIsPermitReady(true);
      } catch (error) {
        console.error('Error during role assignment or permission loading:', error);
      }
    };

    loadPermissions();
  }, [user]);

  // Function to check user permission by calling the backend API
  const checkPermission = async (action: string, resourceType: string, resourceId: string): Promise<boolean> => {
    if (!user?.id) {
      console.error('User ID is undefined, cannot check permission.');
      return false;
    }

    try {
      const response = await apiClient.post(
        '/api/policies/check-permission',
        {
          userId: user?.id,
          action,
          resourceType,
          resourceId
        },
        {
          headers: {
            'user-id': user?.id
          }
        }
      );
      return response.data.permitted;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{ userId: user?.id || null, ability, isPermitReady, checkPermission }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
