import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";

export default function MemoryUI() {
  const ensureCore = useMutation(api.coreMemories.utils.getOrCreate);

  useEffect(() => {
    void ensureCore();
  }, [ensureCore]);

  return (
    <div className="h-full flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b">
        <h1 className="text-xl font-semibold accent-text">Core Memories</h1>
      </header>
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
          <MemoryEditor />
        </div>
      </div>
    </div>
  );
}

function MemoryEditor() {
  const mem = useQuery(api.coreMemories.utils.get, {});
  const update = useMutation(api.coreMemories.utils.update);
  const append = useMutation(api.coreMemories.utils.append);
  const replace = useMutation(api.coreMemories.utils.replace);
  const remove = useMutation(api.coreMemories.utils.remove);

  const [persona, setPersona] = useState("");
  const [human, setHuman] = useState("");
  const [appendField, setAppendField] = useState<"persona" | "human">("persona");
  const [appendText, setAppendText] = useState("");
  const [replaceField, setReplaceField] = useState<"persona" | "human">("persona");
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");

  useEffect(() => {
    if (mem) {
      setPersona(mem.persona ?? "");
      setHuman(mem.human ?? "");
    }
  }, [mem]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Edit Memory</h2>
      <div className="space-y-2">
        <label className="text-sm font-medium">Persona</label>
        <textarea className="w-full border rounded p-2" rows={5} value={persona} onChange={(e) => setPersona(e.target.value)} />
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => void update({ persona })}>
          Save Persona
        </button>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Human</label>
        <textarea className="w-full border rounded p-2" rows={5} value={human} onChange={(e) => setHuman(e.target.value)} />
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => void update({ human })}>
          Save Human
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-medium">Append</h3>
          <select className="border rounded p-2" value={appendField} onChange={(e) => setAppendField(e.target.value as any)}>
            <option value="persona">persona</option>
            <option value="human">human</option>
          </select>
          <input className="border rounded p-2 w-full" placeholder="Text to append" value={appendText} onChange={(e) => setAppendText(e.target.value)} />
          <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={() => void append({ field: appendField, text: appendText })}>
            Append
          </button>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium">Replace</h3>
          <select className="border rounded p-2" value={replaceField} onChange={(e) => setReplaceField(e.target.value as any)}>
            <option value="persona">persona</option>
            <option value="human">human</option>
          </select>
          <input className="border rounded p-2 w-full" placeholder="Exact text to replace" value={oldText} onChange={(e) => setOldText(e.target.value)} />
          <input className="border rounded p-2 w-full" placeholder="New text" value={newText} onChange={(e) => setNewText(e.target.value)} />
          <button className="px-3 py-2 bg-orange-600 text-white rounded" onClick={() => void replace({ field: replaceField, oldContent: oldText, newContent: newText })}>
            Replace
          </button>
        </div>
      </div>
      <button className="px-3 py-2 bg-red-600 text-white rounded w-min" onClick={() => void remove()}>
        Delete Memory
      </button>
    </div>
  );
}
