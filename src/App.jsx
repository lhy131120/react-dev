import { RouterProvider } from "react-router";
import router from "./routes/router";
import { LoadingProvider } from "./context/LoadingContext";
import Loading from "./components/Loading";

export default function App() {
  return (
    <LoadingProvider>
      <Loading />
      <RouterProvider router={router} />
    </LoadingProvider>
  );
}