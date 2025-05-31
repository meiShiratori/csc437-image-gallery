import { useState } from "react";

interface INameEditorProps {
  initialValue: string;
  imageId: string;
  onNameChanged: (newName: string) => void;
}

export function ImageNameEditor({ initialValue, imageId, onNameChanged }: INameEditorProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [input, setInput] = useState(initialValue);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmitPressed() {
    setWorking(true);
    setError(false);
    try {
      const res = await fetch("/api/images");
      if (!res.ok) throw new Error("Request failed");
      onNameChanged(input);
      setIsEditingName(false);
    } catch {
      setError(true);
    } finally {
      setWorking(false);
    }
  }

  if (isEditingName) {
    return (
      <div style={{ margin: "1em 0" }}>
        <label>
          New Name{" "}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={working}
          />
        </label>
        <button
          disabled={input.length === 0 || working}
          onClick={handleSubmitPressed}
        >
          Submit
        </button>
        <button disabled={working} onClick={() => setIsEditingName(false)}>
          Cancel
        </button>
        {working && <p>Working...</p>}
        {error && <p style={{ color: "red" }}>Error sending request</p>}
      </div>
    );
  }

  return (
    <div style={{ margin: "1em 0" }}>
      <button onClick={() => setIsEditingName(true)}>Edit name</button>
    </div>
  );
}
