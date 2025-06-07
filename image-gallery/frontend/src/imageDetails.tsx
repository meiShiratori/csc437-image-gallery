import { useParams } from "react-router-dom";
import type { IApiImageData } from "../../shared/ApiImageData";
import { ImageNameEditor } from "./ImageNameEditor";
import "./images/Images.css";

interface Props {
  images: IApiImageData[];
  loading: boolean;
  error: boolean;
  onNameChanged: (id: string, newName: string) => void;
}

export function ImageDetails({ images, loading, error, onNameChanged }: Props) {
  const { id } = useParams();
  const image = images.find((img) => img.id === id);

  if (loading) return <p>Loading image...</p>;
  if (error || !image) return <h2>Image not found</h2>;

  return (
    <div className="ImageDetails">
      <h2>{image.name}</h2>
      <p>By {image.author?.username ?? "unknown"}</p>
      <ImageNameEditor
        initialValue={image.name}
        imageId={image.id}
        onNameChanged={(newName) => onNameChanged(image.id, newName)}
      />
      <img className="ImageDetails-img" src={image.src} alt={image.name} />
    </div>
  );
}

