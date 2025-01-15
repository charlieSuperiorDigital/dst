"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ScopeItem {
  id: string;
  content: string;
}

export default function RownCountSummary() {
  const [scopeItems, setScopeItems] = useState<ScopeItem[]>([]);
  const [newItem, setNewItem] = useState("");

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

  const handleRemoveItem = (id: string) => {
    setScopeItems(scopeItems.filter((item) => item.id !== id));
  };

  return (
    <div className="container p-6 space-y-6 max-w-[500px] ">
      <Card>
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
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
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
          <Button onClick={handleAddItem} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Scope Item
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}