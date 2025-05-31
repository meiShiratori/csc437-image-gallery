import type { IApiImageData } from "../../../shared/ApiImageData";

import "./Images.css";

interface IImageGridProps {
  images: IApiImageData[];
}

export function ImageGrid({ images }: IImageGridProps) {
  return (
    <div className="ImageGrid">
      {images.map((image) => (
        <div key={image.id} className="ImageGrid-photo-container">
          <a href={"/images/" + image.id}>
            <img src={image.src} alt={image.name} />
          </a>
        </div>
      ))}
    </div>
  );
}
