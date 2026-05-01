'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useBoards } from '@/store/useBoards';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface CreateBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function CreateBoardModal({ open, onOpenChange }: CreateBoardModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-blue-500');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createBoard } = useBoards();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      const boardId = await createBoard({
        name: name.trim(),
        description: description.trim() || undefined,
        color: selectedColor,
        ownerId: '', // Will be set by the hook
        members: [], // Will be set by the hook
      });

      // Reset form
      setName('');
      setDescription('');
      setSelectedColor('bg-blue-500');

      // Close modal
      onOpenChange(false);

      // Navigate to the new board
      router.push(`/board/${boardId}`);
    } catch (error) {
      console.error('Failed to create board:', error);
      setError('Failed to create board. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create new board</DialogTitle>
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
              disabled={isCreating}
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
              disabled={isCreating}
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
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create board'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
