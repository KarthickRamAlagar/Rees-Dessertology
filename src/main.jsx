import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import "./lib/i18n";
import { queryClient } from "./lib/queryClient";
import { store } from "./store/store";
import AuthProvider from "./features/auth/AuthProvider";
import "./index.css";
import App from "./App.jsx";

// Dev-only floating Redux inspector (bottom-right). The dynamic import is
// behind import.meta.env.DEV, so it is dropped from production builds.
const ReduxDevPanel = import.meta.env.DEV ? lazy(() => import("./components/dev/ReduxDevPanel")) : null;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <App />
            {ReduxDevPanel && (
              <Suspense fallback={null}>
                <ReduxDevPanel />
              </Suspense>
            )}
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
