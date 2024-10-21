import React, { createContext, useContext, useState, useEffect } from 'react';
import { createMongoAbility, AbilityBuilder, PureAbility } from '@casl/ability';
import { initPermit, permitState } from '../lib/permit';
import { useUser } from '@clerk/nextjs';

// Define a type for our CASL rules
type CaslRule = {
  action: string;
  subject: string;
  fields?: string[];
  conditions?: any;
};

interface AppContextType {
  userId: string | null;
  ability: PureAbility | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [ability, setAbility] = useState<PureAbility | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      if (user?.id) {
        const permit = initPermit(user.id);

        await permit.loadLocalStateBulk([
          { action: 'create', resource: 'Category' },
          { action: 'read', resource: 'Category' },
          { action: 'update', resource: 'Category' },
          { action: 'delete', resource: 'Category' },
          { action: 'create', resource: 'Document' },
          { action: 'read', resource: 'Document' },
          { action: 'update', resource: 'Document' },
          { action: 'delete', resource: 'Document' },
        ]);

        const caslRules = permitState.getCaslJson() as CaslRule[];
        const { can, build } = new AbilityBuilder(createMongoAbility);

        caslRules.forEach(rule => {
          can(rule.action, rule.subject, rule.fields, rule.conditions);
        });

        setAbility(build());
      }
    };

    loadPermissions();
  }, [user?.id]);

  return (
    <AppContext.Provider value={{ userId: user?.id || null, ability }}>
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