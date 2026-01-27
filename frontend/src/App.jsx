import AppRouter from "./router/AppRouter";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#ecfdf5",
            border: "1px solid #22c55e",
            color: "#166534",
            padding: "14px 20px",
            fontWeight: "500",
            fontSize: "14px",
          },
          iconTheme: {
            primary: "#22c55e",
            secondary: "#d1fae5",
          },
        }}
      />
      <AppRouter />
    </>
  );
};

export default App;
