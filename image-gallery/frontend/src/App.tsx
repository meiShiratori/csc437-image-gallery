import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AllImages } from "./images/AllImages";
import { ImageDetails } from "./imageDetails";
import { UploadPage } from "./UploadPage";
import { LoginPage } from "./LoginPage";
import { MainLayout } from "./MainLayout";
import type { IApiImageData } from "../../shared/ApiImageData";
import { ValidRoutes } from "../../shared/ValidRoutes";
import { ImageSearchForm } from "./images/ImageSearchForm";
import { useRef } from "react";
import { ProtectedRoute } from "./ProtectedRoute";



function App() {
  const [images, setImages] = useState<IApiImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (saved) setToken(saved);
    fetchImagesWithQuery("");
  }, []);

  function handleImageSearch() {
    fetchImagesWithQuery(searchString);
  }

  async function fetchImagesWithQuery(query: string) {
    const thisRequest = ++requestIdRef.current;
    setLoading(true);
    setError(false);

    const url = query
      ? `/api/images?name=${encodeURIComponent(query)}`
      : "/api/images";

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch images");

      const data = await res.json();

      if (thisRequest === requestIdRef.current) {
        setImages(data);
        setLoading(false);
      }
    } catch (err) {
      if (thisRequest === requestIdRef.current) {
        setError(true);
        setLoading(false);
      }
    }
  }

  function handleNameChange(id: string, newName: string) {
    fetch(`/api/images/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ name: newName })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Rename failed");
        return res.json();
      })
      .then(() => fetchImagesWithQuery(searchString))
      .catch((err) => console.error("Rename error:", err));
  }

  return (
<Routes>
  <Route path={ValidRoutes.HOME} element={<MainLayout />}>
    <Route
      index
      element={
        <ProtectedRoute authToken={token}>
          <AllImages
            images={images}
            loading={loading}
            error={error}
            searchPanel={
              <ImageSearchForm
                searchString={searchString}
                onSearchStringChange={setSearchString}
                onSearchRequested={handleImageSearch}
              />
            }
          />
        </ProtectedRoute>
      }
    />
    <Route
      path={ValidRoutes.IMAGE_DETAILS}
      element={
        <ProtectedRoute authToken={token}>
          <ImageDetails
            images={images}
            loading={loading}
            error={error}
            onNameChanged={handleNameChange}
          />
        </ProtectedRoute>
      }
    />
    <Route
      path={ValidRoutes.UPLOAD}
      element={
        <ProtectedRoute authToken={token}>
          <UploadPage />
        </ProtectedRoute>
      }
    />
    <Route
      path={ValidRoutes.LOGIN}
      element={
        <LoginPage
          onLoginSuccess={(token) => {
            localStorage.setItem("token", token);
            setToken(token);
          }}
        />
      }
    />
    <Route
      path={ValidRoutes.REGISTER}
      element={
        <LoginPage
          isRegistering={true}
          onLoginSuccess={(token) => {
            localStorage.setItem("token", token);
            setToken(token);
          }}
        />
      }
    />
  </Route>
</Routes>

  );
}


export default App;
