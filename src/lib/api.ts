import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

export async function createRelationship(relationshipData: { userId: string, relation: string, resourceType: string, resourceKey: string }) {
    try {
        const response = await apiClient.post('/api/policies/create-relationship', relationshipData);
        return response.data;
    } catch (error) {
        console.error('Error creating relationship:', error);
        throw error;
    }
}


export default apiClient;
