import { useState } from "react";

export function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.readAsDataURL(file);
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = (err) => reject(err);
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected) {
      const url = await readAsDataURL(selected);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setIsSubmitting(true);
    setMessage("");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", name);

    const token = localStorage.getItem("token");

    const res = await fetch("/api/images", {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (res.ok) {
      setMessage("Upload successful!");
      setFile(null);
      setPreviewUrl(null);
      setName("");
    } else {
      const err = await res.json().catch(() => ({}));
      setMessage(`Upload failed: ${err.message ?? "Unknown error"}`);
    }

    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} aria-live="polite">
      <div>
        <label htmlFor="fileInput">Choose image to upload: </label>
        <input
          id="fileInput"
          name="image"
          type="file"
          accept=".png,.jpg,.jpeg"
          onChange={handleFileChange}
          required
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label htmlFor="nameInput">
          Image title:
          <input
            id="nameInput"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </label>
      </div>
      {previewUrl && (
        <div>
          <img
            style={{ width: "20em", maxWidth: "100%" }}
            src={previewUrl}
            alt="Preview"
          />
        </div>
      )}
      <input type="submit" value="Confirm upload" disabled={isSubmitting} />
      {message && <p>{message}</p>}
    </form>
  );
}
