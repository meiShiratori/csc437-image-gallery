import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AllImages } from "./images/AllImages";
import { ImageDetails } from "./imageDetails";
import { UploadPage } from "./UploadPage";
import { LoginPage } from "./LoginPage";
import { MainLayout } from "./MainLayout";
import type { IApiImageData } from "../../shared/ApiImageData";
import { ValidRoutes } from "../../shared/ValidRoutes";




function App() {
  const [images, setImages] = useState<IApiImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/images")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch images");
        return res.json();
      })
      .then((data) => setImages(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  function handleNameChange(id: string, newName: string) {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, name: newName } : img
      )
    );
  }

  return (
    <Routes>
      <Route path={ValidRoutes.HOME} element={<MainLayout />}>
        <Route
          index
          element={
            <AllImages images={images} loading={loading} error={error} />
          }
        />
        <Route
          path={ValidRoutes.IMAGE_DETAILS}
          element={
            <ImageDetails
              images={images}
              loading={loading}
              error={error}
              onNameChanged={handleNameChange}
            />
          }
        />
        <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
        <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />
      </Route>
    </Routes>
  );
}

export default App;
