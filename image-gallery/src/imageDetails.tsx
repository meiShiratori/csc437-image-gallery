import { useParams } from "react-router-dom";
import { fetchDataFromServer } from "./MockAppData";
import type { IImageData } from "./MockAppData";

export function ImageDetails() {
  const { id } = useParams();
  const images: IImageData[] = fetchDataFromServer();
  const image = images.find((img) => img.id === id);

  if (!id || !image) return <p>Image not found</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{image.name}</h2>
      <img src={image.src} alt={image.name} style={{ maxWidth: "100%" }} />
      <p>Author: {image.author.username}</p>
    </div>
  );
}
