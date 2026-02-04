import { RouterProvider } from "react-router";
import router from "@/routes/router";
import { LoadingProvider } from "@/context/loading";
import { Loading, LoadingInitializer } from "@/components/common";

export default function App() {
  return (
    <LoadingProvider>
      <LoadingInitializer>
        <Loading />
        <RouterProvider router={router} />
      </LoadingInitializer>
    </LoadingProvider>
  );
}