'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import {
  addBoard as addBoardToFirestore,
  updateBoard as updateBoardInFirestore,
  deleteBoard as deleteBoardFromFirestore,
  listenToUserBoards,
} from '@/lib/firestore';
import type { Board, BoardsState, Role } from '@/types';

export function useBoards(): BoardsState {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);

  // Initialize listener for user's boards
  const initListener = useCallback((): (() => void) => {
    if (!user) {
      setBoards([]);
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    const unsubscribe = listenToUserBoards(user.uid, (fetchedBoards) => {
      setBoards(fetchedBoards);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // Create a new board
  const createBoard = useCallback(
    async (data: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const boardId = await addBoardToFirestore({
          ...data,
          ownerId: user.uid,
          members:
            data.members && Object.keys(data.members).length > 0
              ? data.members
              : { [user.uid]: 'admin' as Role },
        });
        return boardId;
      } catch (error) {
        console.error('Error creating board:', error);
        throw error;
      }
    },
    [user]
  );

  // Update an existing board
  const updateBoard = useCallback(async (id: string, updates: Partial<Omit<Board, 'id'>>) => {
    try {
      await updateBoardInFirestore(id, updates);
    } catch (error) {
      console.error('Error updating board:', error);
      throw error;
    }
  }, []);

  // Delete a board
  const deleteBoard = useCallback(async (id: string) => {
    try {
      await deleteBoardFromFirestore(id);
    } catch (error) {
      console.error('Error deleting board:', error);
      throw error;
    }
  }, []);

  // Set up listener when component mounts
  useEffect(() => {
    const unsubscribe = initListener();
    return unsubscribe;
  }, [initListener]);

  return {
    boards,
    loading,
    initListener,
    createBoard,
    updateBoard,
    deleteBoard,
  };
}
