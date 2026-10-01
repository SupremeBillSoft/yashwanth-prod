// src/common/ErrorBoundary.jsx
import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";

export default function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error(error); // log for debugging

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Something went wrong</h1>
      <p>
        {isRouteErrorResponse(error)
          ? `${error.status} - ${error.statusText}`
          : error?.message || "Unexpected error occurred."}
      </p>
      <button onClick={() => navigate("/")}>Go back home</button>
    </div>
  );
}