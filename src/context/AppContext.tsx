// src/context/app-context.tsx

import React, { createContext, useContext, useState, useEffect } from 'react'
import apiClient from '@/lib/api'
import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType } from '@casl/ability'
import { useUser } from '@clerk/nextjs'

interface Category {
  id: string
  name: string
  description?: string
}

interface Document {
  id: string
  title: string
  category: string
  createdAt: Date
  lastModified: Date
  author: string
  status: 'draft' | 'published'
  owner: string
}

type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete'
type Subjects = 'Category' | 'Document' | 'all'

type AppAbility = Ability<[Actions, Subjects]>

interface AppContextType {
  userId: string | null
  ability: AppAbility
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const [ability, setAbility] = useState<AppAbility>(() => new Ability([]))

  useEffect(() => {
    async function loadUserRelationships() {
      if (!user?.id) return

      try {
        const response = await apiClient.get('/api/policies/get-user-relationships', {
          headers: { 'user-id': user.id },
        })

        const relationships = response.data.relationships

        const defineAbilitiesFor = (): AppAbility => {
          const { can, rules } = new AbilityBuilder<AppAbility>(Ability as AbilityClass<AppAbility>)

          relationships.forEach((rel: any) => {
            const match = rel.object.match(/^(\w+):(.+)$/)
            if (!match) return

            const [_, resourceType, resourceId] = match
            if (!isSubject(resourceType)) return

            const subject = resourceType as Subjects
            const conditions = { id: resourceId }

            switch (rel.relation) {
              case 'owner':
                can('manage', subject, conditions)
                break
              case 'editor':
                can(['read', 'update'], subject, conditions)
                break
              case 'viewer':
                can('read', subject, conditions)
                break
              default:
                break
            }
          })

          return new Ability(rules) as AppAbility
        }

        const updatedAbility = defineAbilitiesFor()
        setAbility(updatedAbility)
      } catch (error) {
        console.error('Error loading user relationships:', error)
      }
    }

    loadUserRelationships()
  }, [user])

  return (
    <AppContext.Provider value={{ userId: user?.id || null, ability }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

// Helper function to check if a value is a valid subject
function isSubject(value: string): value is Subjects {
  return ['Category', 'Document', 'all'].includes(value)
}
