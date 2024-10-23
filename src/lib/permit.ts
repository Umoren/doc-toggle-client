import { Permit, permitState } from 'permit-fe-sdk';

export const initPermit = (userId: string) => {
    return Permit({
        loggedInUser: userId,
        backendUrl: 'http://localhost:5000/api/policies', // Base API URL, not specific to /check-permission
        customRequestHeaders: {
            'user-id': userId, // Pass user-id in headers
        },
    });
};

export { permitState };
