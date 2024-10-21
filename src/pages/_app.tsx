import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/nextjs';
import { AppProvider } from '../context/AppContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider>
      <AppProvider>
        <SignedIn>
          <Component {...pageProps} />
        </SignedIn>
        <SignedOut>
          <div>Please sign in to access this page</div>
        </SignedOut>
      </AppProvider>
    </ClerkProvider>
  );
}

export default MyApp;