"use client"
import React, { useCallback,useEffect,useState } from 'react'
import LiveCursor from './cursor/LiveCursor'
import { useMyPresence, useOthers } from '@/liveblocks.config'
import CursorChat from './cursor/CursorChat'
import { CursorMode, CursorState,Reaction } from '@/types/type'
import ReactionSelector from './reactions/ReactionButton'
import FlyingReaction from './reactions/FlyingReaction'

const Live = () => {
    const others = useOthers();
    const [{ cursor }, updateMyPresence] = useMyPresence() as any;
    const [cursorState, setCursorState] = useState<CursorState>({
      mode: CursorMode.Hidden,
    });
    const [reactions, setReactions] = useState<Reaction[]>([]);


    const setReaction = useCallback((reaction:string) => {
      setCursorState({mode: CursorMode.Reaction, reaction, isPressed: false})
    },[])

    const handlePointerMove = useCallback((event: React.PointerEvent)=>{
        event.preventDefault();
        if(cursor == null || cursorState.mode != CursorMode.ReactionSelector){
          const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
          const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
  
          updateMyPresence({
              cursor: {
                x,
                y,
              },
          });
        }
        
    },[])

    const handlePointerLeave = useCallback((event: React.PointerEvent)=>{
        setCursorState({mode: CursorMode.Hidden})

        updateMyPresence({cursor: null,message: null});
    },[])

    const handlePointerDown = useCallback((event: React.PointerEvent)=>{
        const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

        updateMyPresence({
            cursor: {
              x,
              y,
            },
        });

        setCursorState((state: CursorState) =>
          cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state
        );
    },[cursorState.mode, setCursorState]);

    const handlePointerUp = useCallback(() => {
      setCursorState((state: CursorState) =>
        cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: false } : state
      );
    }, [cursorState.mode, setCursorState]);

    useEffect(() => {
      const onKeyUp = (e: KeyboardEvent) => {
        if (e.key === "/") {
          setCursorState({
            mode: CursorMode.Chat,
            previousMessage: null,
            message: "",
          });
        } else if (e.key === "Escape") {
          updateMyPresence({ message: "" });
          setCursorState({ mode: CursorMode.Hidden });
        } else if (e.key === "e") {
          setCursorState({ mode: CursorMode.ReactionSelector });
        }
      };
  
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "/") {
          e.preventDefault();
        }
      };
  
      window.addEventListener("keyup", onKeyUp);
      window.addEventListener("keydown", onKeyDown);
  
      return () => {
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("keydown", onKeyDown);
      };
    }, [updateMyPresence]);
  return (
    <div
        className="h-[100vh] w-full flex justify-center items-center text-center border-green-400 border-2"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
    >
        <h1 className="text-5xl text-black">LiveBlocks Saved my ass</h1>
        {reactions.map((r)=>(
          <FlyingReaction
            key={r.timestamp.toString()}
            x={r.point.x}
            y={r.point.y}
            timestamp={r.timestamp}
            value={r.value}
          />
        ))}
        {cursor && (
          <CursorChat
            cursor={cursor}
            cursorState={cursorState}
            setCursorState={setCursorState}
            updateMyPresence={updateMyPresence}
          />
        )}

        {cursorState.mode === CursorMode.ReactionSelector && (
          <ReactionSelector
            setReaction={(reaction) => {
              setReaction(reaction);
            }}
          />
        )}

        <LiveCursor others={others}/>
    </div>
  )
}

export default Live