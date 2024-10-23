import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ClerkProvider, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { AppProvider } from '../context/AppContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useState } from 'react';
import { Button } from "@/components/ui/button";

function MyApp({ Component, pageProps }: AppProps) {
  // Create a QueryClient instance
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <SignedIn>
            <Component {...pageProps} />
          </SignedIn>
          <SignedOut>
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
              <h1 className="text-3xl font-bold mb-4">Welcome to Document Manager</h1>
              <p className="mb-6 text-lg">Please sign in to continue</p>
              <div>
                <SignInButton>
                  {/* Use button text directly */}
                  <Button className="bg-primary text-white px-6 py-3">Sign In</Button>
                </SignInButton>
              </div>
            </div>
          </SignedOut>
        </AppProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default MyApp;
