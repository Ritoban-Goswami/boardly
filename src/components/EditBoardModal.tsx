'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useBoards } from '@/store/useBoards';
import { Loader2 } from 'lucide-react';
import type { Board } from '@/types';

interface EditBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: Board | null;
}

const boardColors = [
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Teal', value: 'bg-teal-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
];

export function EditBoardModal({ open, onOpenChange, board }: EditBoardModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-blue-500');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateBoard } = useBoards();

  // Pre-populate form when board changes
  useEffect(() => {
    if (board) {
      setName(board.name);
      setDescription(board.description || '');
      setSelectedColor(board.color || 'bg-blue-500');
    }
  }, [board]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !board) return;

    setIsUpdating(true);
    setError(null);

    try {
      await updateBoard(board.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        color: selectedColor,
      });

      // Close modal
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update board:', error);
      setError('Failed to update board. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit board</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Board Name */}
          <div className="space-y-2">
            <Label htmlFor="board-name">Board name *</Label>
            <Input
              id="board-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marketing Campaign, Product Roadmap"
              disabled={isUpdating}
              maxLength={100}
            />
          </div>

          {/* Board Description */}
          <div className="space-y-2">
            <Label htmlFor="board-description">Description (optional)</Label>
            <Textarea
              id="board-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this board about?"
              disabled={isUpdating}
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Board color</Label>
            <div className="grid grid-cols-8 gap-2">
              {boardColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`
                    h-8 w-8 rounded-full transition-all
                    ${color.value}
                    ${selectedColor === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''}
                    hover:scale-110
                  `}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
