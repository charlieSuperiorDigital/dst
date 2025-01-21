"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
interface Note {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}
interface ScopeItem {
  id: string;
  content: string;
}
const ScopeItemsAndNotes = () => {
  const [scopeItems, setScopeItems] = useState<ScopeItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newItem, setNewItem] = useState("");
  const [newNote, setNewNote] = useState("");

  const { data: session } = useSession();

  const handleAddItem = () => {
    if (newItem.trim()) {
      setScopeItems([
        ...scopeItems,
        {
          id: Math.random().toString(36).substr(2, 9),
          content: newItem.trim(),
        },
      ]);
      setNewItem("");
    }
  };
  const handleNewNote = () => {
    if (newNote.trim()) {
      setNotes([
        ...notes,
        {
          id: Math.random().toString(36).substr(2, 9),
          content: newNote.trim(),
          author: session?.user?.name || "Unknown",
          createdAt: new Date().toISOString(),
        },
      ]);
      setNewNote("");
    }
  };
  const handleRemoveItem = (id: string) => {
    setScopeItems(scopeItems.filter((item) => item.id !== id));
  };
  const handleRemoveNote = (id: string) => {
    setNotes(notes.filter((item) => item.id !== id));
  };

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
                <span className="flex-grow">
                  {index + 1}. {item.content}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500 " />
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardHeader>
          <CardTitle>Project Scope of Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Enter scope "
          />
          <Button onClick={handleAddItem} variant="success" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Scope Item
          </Button>
        </CardContent>
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
                <div className="flex items-center justify-between">
                  <span className="flex-grow">
                    {index + 1}. {item.content}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveNote(item.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
                <div className="text-sm text-gray-500 flex justify-between">
                  <span>Author: {item.author}</span>
                  <span>
                    Created: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardHeader>
          <CardTitle>Project Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Enter note "
          />
          <Button onClick={handleNewNote} variant="success" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add note
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScopeItemsAndNotes;
