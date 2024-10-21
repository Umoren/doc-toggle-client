import { Permit, permitState } from 'permit-fe-sdk';

export const initPermit = (userId: string) => {
    return Permit({
        loggedInUser: userId,
        backendUrl: '/api/policies/check-permission', // This is the correct endpoint from your backend
    });
};

export { permitState };