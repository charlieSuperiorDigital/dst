"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuote } from "../../context/quote-context";
import { apiRequest } from "@/utils/client-side-api";
type Note = {
  id: string;
  order: number;
  note: string;
  quotationId: string;
};
type ScopeOfWork = {
  id: string;
  order?: number;
  scopeOfWork: string;
  quotationId: string;
};

const ScopeItemsAndNotes = () => {
  const { quoteContext } = useQuote();
  const [scopeItems, setScopeItems] = useState<ScopeOfWork[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newItem, setNewItem] = useState("");
  const [newNote, setNewNote] = useState("");
  const { isLocked } = useQuote();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState("");

  const fetchScopeItems = async () => {
    try {
      const response = await apiRequest({
        method: "get",
        url: `/api/Quotation/ScopeOfWork/${quoteContext.id}`,
      });

      setScopeItems(response);
    } catch (error) {
      console.error("Error fetching scope items:", error);
    }
  };
  const fetchNotes = async () => {
    try {
      const response = await apiRequest({
        method: "get",
        url: `/api/Quotation/Note/${quoteContext.id}`,
      });

      setNotes(response);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.trim()) return; // Evita agregar elementos vacíos

    try {
      await apiRequest({
        method: "post",
        url: `/api/Quotation/ScopeOfWork`,
        data: {
          quotationId: quoteContext.id,
          scopeOfWorkText: newItem.trim(), // Usar `newItem`, no `scopeItems`
        },
      });

      setNewItem("");
      fetchScopeItems();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };
  const handleNewNote = async () => {
    try {
      apiRequest({
        method: "post",
        url: `/api/Quotation/Note`,
        data: {
          quotationId: quoteContext.id,
          noteText: newNote,
        },
      });
      setNewNote("");
      fetchNotes();
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };
  const handleRemoveItem = async (id: string) => {
    try {
      await apiRequest({
        method: "delete",
        url: `/api/Quotation/ScopeOfWork/${id}`,
      });

      setScopeItems(scopeItems.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };
  const handleRemoveNote = async (id: string) => {
    try {
      await apiRequest({
        method: "delete",
        url: `/api/Quotation/Note/${id}`,
      });
      setNotes(notes.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error removing note:", error);
    }
  };

  const handleEdit = (id: string, type: "scope" | "note") => {
    if (type === "scope") {
      const item = scopeItems.find((item) => item.id === id);
      if (item) {
        setEditingItemId(id);
        setEditedText(item.scopeOfWork);
      }
    } else {
      const note = notes.find((note) => note.id === id);
      if (note) {
        setEditingNoteId(id);
        setEditedText(note.note);
      }
    }
  };

  const handleSaveEdit = async (id: string, type: "scope" | "note") => {
    try {
      if (type === "scope") {
        await apiRequest({
          method: "put",
          url: `/api/Quotation/ScopeOfWork`,
          data: {
            sowId: id,
            scopeOfWorkText: editedText,
          },
        });
        setScopeItems(
          scopeItems.map((item) =>
            item.id === id ? { ...item, scopeOfWork: editedText } : item
          )
        );
        setEditingItemId(null);
      } else {
        await apiRequest({
          method: "put",
          url: `/api/Quotation/Note`,
          data: {
            noteId: id,
            noteText: editedText,
          },
        });
        setNotes(
          notes.map((note) =>
            note.id === id ? { ...note, note: editedText } : note
          )
        );
        setEditingNoteId(null);
      }
      setEditedText("");
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
    }
  };

  useEffect(() => {
    fetchScopeItems();
    fetchNotes();
  }, []);

  return (
    <div className="flex space-x-1">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Scope Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {scopeItems.map((item, index) => (
              <li
                key={item.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group"
              >
                {editingItemId === item.id ? (
                  <div className="flex items-center w-full">
                    <Input
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="flex-grow mr-2"
                    />
                    <Button onClick={() => handleSaveEdit(item.id, "scope")}>
                      Save
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="flex-grow">
                      {index + 1}. {item.scopeOfWork}
                    </span>
                    {!isLocked && (
                      <div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item.id, "scope")}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
        {!isLocked && (
          <>
            <CardHeader>
              <CardTitle>Scope of Work</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Enter scope "
              />
              <Button
                onClick={handleAddItem}
                variant="success"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Scope Item
              </Button>
            </CardContent>
          </>
        )}
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {notes.map((item, index) => (
              <li
                key={item.id}
                className="flex flex-col p-3 bg-muted/50 rounded-lg group space-y-1"
              >
                {editingNoteId === item.id ? (
                  <div className="flex items-center w-full">
                    <Input
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="flex-grow mr-2"
                    />
                    <Button onClick={() => handleSaveEdit(item.id, "note")}>
                      Save
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="flex-grow">
                        {index + 1}. {item.note}
                      </span>
                      {!isLocked && (
                        <div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item.id, "note")}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveNote(item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 flex justify-between">
                      {/* <span>Author: {item.author}</span> */}
                      <span>
                        {/* Created: {new Date(item.createdAt).toLocaleDateString()} */}
                      </span>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </CardContent>

        {!isLocked && (
          <>
            <CardHeader>
              <CardTitle>Quotes Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter note"
              />
              <Button
                onClick={handleNewNote}
                variant="success"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add note
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default ScopeItemsAndNotes;
