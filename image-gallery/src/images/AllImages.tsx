import { useState } from "react";
import { fetchDataFromServer } from "../MockAppData.ts";
import { ImageGrid } from "./ImageGrid.tsx";
import type { IImageData } from "../MockAppData.ts";

export function AllImages() {
  const [imageData, _setImageData] = useState<IImageData[]>(fetchDataFromServer());

  return (
    <>
      <h2>All Images</h2>
      <ImageGrid images={imageData} />
    </>
  );
}
