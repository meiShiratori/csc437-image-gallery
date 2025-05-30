import { useParams } from "react-router-dom";
import { fetchDataFromServer } from "../MockAppData.ts";
import type { IImageData } from "../MockAppData.ts";
import "./Images.css";

export function ImageDetails() {
  const { id } = useParams();
  const images: IImageData[] = fetchDataFromServer();
  const image = images.find((img) => img.id === id);

  if (!id || !image) {
    return <h2>Image not found</h2>;
  }

  return (
    <div className="ImageDetails">
      <h2>{image.name}</h2>
      <p>By {image.author.username}</p>
      <img className="ImageDetails-img" src={image.src} alt={image.name} />
    </div>
  );
}
