import { RouterProvider } from "react-router-dom";
import { router } from "./router/rootRouter";
import AlertContainer from "./components/common/AlertContainer";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <AlertContainer />
    </>
  );
}

export default App;
