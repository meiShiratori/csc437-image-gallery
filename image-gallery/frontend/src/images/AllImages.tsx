import { ImageGrid } from "./ImageGrid";
import { IApiImageData } from "../../../shared/ApiImageData";

interface Props {
  images: IApiImageData[];
  loading: boolean;
  error: boolean;
  searchPanel: React.ReactNode;
}


export function AllImages({ images, loading, error, searchPanel }: Props) {
  if (loading) return <p>Loading images...</p>;
  if (error) return <p>Error loading images</p>;

return (
  <>
    {searchPanel}
    <h2>All Images</h2>
    <ImageGrid images={images} />
  </>
);
}
