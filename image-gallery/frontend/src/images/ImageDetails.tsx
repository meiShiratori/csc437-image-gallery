import { useParams } from "react-router-dom";
import { IApiImageData } from "../../../shared/ApiImageData";


import "./Images.css";

interface Props {
  images: IApiImageData[];
  loading: boolean;
  error: boolean;
}

export function ImageDetails({ images, loading, error }: Props) {
  const { id } = useParams();
  const image = images.find((img) => img.id === id);

  if (loading) return <p>Loading image...</p>;
  if (error || !image) return <h2>Image not found</h2>;

  return (
    <div className="ImageDetails">
      <h2>{image.name}</h2>
      <p>By {image.author.username}</p>
      <img className="ImageDetails-img" src={image.src} alt={image.name} />
    </div>
  );
}
